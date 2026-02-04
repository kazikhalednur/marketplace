def run() {

    stage('Checkout') {
        steps {
            checkout scm
        }
    }

    stage('Create env file') {
        steps {
            withCredentials([
                file(credentialsId: 'gpg-private-key', variable: 'GPG_KEY'),
                string(credentialsId: 'gpg-passphrase', variable: 'GPG_PASSPHRASE')
            ]) {
                sh '''
                    cd database/staging/postgres
                    export GNUPGHOME=$(mktemp -d)

                    gpg --batch --import "$GPG_KEY"

                    gpg --batch --yes \
                        --pinentry-mode loopback \
                        --passphrase "$GPG_PASSPHRASE" \
                        --decrypt .env.gpg > .env
                '''
            }
        }
    }

    stage('Build and Deploy') {
        steps {
            sh 'docker compose -f database/staging/postgres/compose.yaml up --build -d'
        }
    }

    stage('Health Check') {
        steps {
            sh '''
                timeout=30
                sleep_time=2
                counter=0
                max_attempts=$((timeout/sleep_time))
                
                echo "Waiting for marketplace-staging-db to be healthy..."
                
                while [ $counter -lt $max_attempts ]; do
                    status=$(docker inspect --format '{{.State.Health.Status}}' marketplace-staging-db 2>/dev/null || echo "not-found")
                    
                    if [ "$status" = "healthy" ]; then
                        echo "Container marketplace-staging-db is healthy!"
                        exit 0
                    fi
                    
                    echo "Status: $status. Retrying in ${sleep_time}s... ($((counter+1))/$max_attempts)"
                    sleep $sleep_time
                    counter=$((counter+1))
                done
                
                echo "Timeout: marketplace-staging-db did not become healthy."
                exit 1
            '''
        }
    }
}

return this
