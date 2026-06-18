def call() {

    stage('Create env file') {
        withCredentials([
            file(credentialsId: 'gpg-private-key', variable: 'GPG_KEY'),
            string(credentialsId: 'gpg-passphrase', variable: 'GPG_PASSPHRASE')
        ]) {
            sh '''
                cd database/redis/compose/staging

                export GNUPGHOME=$(mktemp -d)

                gpg --batch --import "$GPG_KEY"

                gpg --batch --yes \
                    --pinentry-mode loopback \
                    --passphrase "$GPG_PASSPHRASE" \
                    --decrypt .env.gpg > .env
            '''
        }
    }

    stage('Deploy') {
        sh 'docker compose -f compose.staging.yaml up --build -d redis'
    }

    stage('Health Check') {
        sh '''
            timeout=30
            sleep_time=2
            counter=0
            max_attempts=$((timeout/sleep_time))
            
            echo "Waiting for staging-marketplace-redis to be healthy..."
            
            while [ $counter -lt $max_attempts ]; do
                status=$(docker inspect --format '{{.State.Health.Status}}' staging-marketplace-redis 2>/dev/null || echo "not-found")
                
                if [ "$status" = "healthy" ]; then
                    echo "Container staging-marketplace-redis is healthy!"
                    exit 0
                fi
                
                echo "Status: $status. Retrying in ${sleep_time}s... ($((counter+1))/$max_attempts)"
                sleep $sleep_time
                counter=$((counter+1))
            done
            
            echo "Timeout: staging-marketplace-redis did not become healthy."
            exit 1
        '''
    }
}

return this

