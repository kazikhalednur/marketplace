def call() {

    stage('Checkout') {
        checkout scm
    }

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
            
            echo "Waiting for aistor-server to be healthy..."
            
            while [ $counter -lt $max_attempts ]; do
                # Check if container is running
                is_running=$(docker inspect --format '{{.State.Running}}' aistor-server 2>/dev/null || echo "false")
                
                if [ "$is_running" != "true" ]; then
                    echo "Container aistor-server is not running!"
                    exit 1
                fi
                
                # Check health status
                status=$(docker inspect --format '{{.State.Health.Status}}' aistor-server 2>/dev/null || echo "no-healthcheck")
                
                if [ "$status" = "healthy" ]; then
                    echo "Container aistor-server is healthy!"
                    exit 0
                fi
                
                # If no healthcheck defined, verify MinIO is responding
                if [ "$status" = "no-healthcheck" ]; then
                    if curl -f http://127.0.0.1:9000/minio/health/live 2>/dev/null; then
                        echo "MinIO is responding to health checks!"
                        exit 0
                    fi
                fi
                
                echo "Status: $status (running: $is_running). Retrying in ${sleep_time}s... ($((counter+1))/$max_attempts)"
                sleep $sleep_time
                counter=$((counter+1))
            done
            
            echo "Timeout: aistor-server did not become healthy within ${timeout}s."
            docker logs --tail 50 aistor-server
            exit 1
        '''
    }
}

return this
