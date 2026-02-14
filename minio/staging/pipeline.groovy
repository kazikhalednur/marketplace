def call() {

    stage('Create env and license file') {
        withCredentials([
            file(credentialsId: 'gpg-private-key', variable: 'GPG_KEY'),
            string(credentialsId: 'gpg-passphrase', variable: 'GPG_PASSPHRASE')
        ]) {
            sh '''
                cd minio/staging
                
                export GNUPGHOME=$(mktemp -d)

                gpg --batch --import "$GPG_KEY"

                gpg --batch --yes \
                    --pinentry-mode loopback \
                    --passphrase "$GPG_PASSPHRASE" \
                    --decrypt .env.gpg > .env
                
                gpg --batch --yes \
                    --pinentry-mode loopback \
                    --passphrase "$GPG_PASSPHRASE" \
                    --decrypt minio.license.gpg > minio.license
            '''
        }
    }

    stage('Deploy') {
        sh 'docker compose -f minio/staging/compose.yaml up --build -d'
    }

    stage('Health Check') {
        sh '''
            timeout=90
            sleep_time=3
            counter=0
            max_attempts=$((timeout/sleep_time))
            
            echo "Waiting for staging-aistor-server to be healthy..."
            
            while [ $counter -lt $max_attempts ]; do
                # Check if container exists and is running
                if ! docker inspect staging-aistor-server >/dev/null 2>&1; then
                    echo "Container staging-aistor-server does not exist!"
                    exit 1
                fi
                
                is_running=$(docker inspect --format '{{.State.Running}}' staging-aistor-server 2>/dev/null || echo "false")
                
                if [ "$is_running" != "true" ]; then
                    echo "Container staging-aistor-server is not running!"
                    echo "=== Container logs ==="
                    docker logs --tail 50 staging-aistor-server 2>/dev/null || true
                    exit 1
                fi
                
                # Check health status
                status=$(docker inspect --format '{{.State.Health.Status}}' staging-aistor-server 2>/dev/null || echo "no-healthcheck")
                
                if [ "$status" = "healthy" ]; then
                    echo "Container staging-aistor-server is healthy!"
                    exit 0
                fi
                
                # If no healthcheck defined, verify MinIO is responding
                if [ "$status" = "no-healthcheck" ]; then
                    if docker exec staging-aistor-server mc ready local 2>/dev/null; then
                        echo "MinIO is ready and responding!"
                        exit 0
                    fi
                fi
                
                echo "Status: $status (running: $is_running). Retrying in ${sleep_time}s... ($((counter+1))/$max_attempts)"
                sleep $sleep_time
                counter=$((counter+1))
            done
            
            echo "Timeout: staging-aistor-server did not become healthy within ${timeout}s."
            echo "=== Final container logs ==="
            docker logs --tail 100 staging-aistor-server
            exit 1
        '''
    }
}

return this
