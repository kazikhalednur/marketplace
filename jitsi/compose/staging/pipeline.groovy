def call() {

    stage('Checkout') {
        checkout scm
    }

    stage('Create env file') {
        withCredentials([
            file(credentialsId: 'gpg-private-key', variable: 'GPG_KEY'),
            string(credentialsId: 'gpg-passphrase', variable: 'GPG_PASSPHRASE')
        ]) {
            sh '''
                cd jitsi/compose/staging
                
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
        sh 'docker compose -f jitsi/docker-compose.yml --env-file jitsi/compose/staging/.env up --build -d'
    }

    stage('Health Check') {
        sh '''
            timeout=120
            sleep_time=5
            counter=0
            max_attempts=$((timeout/sleep_time))
            
            echo "Waiting for Jitsi services to be healthy..."
            
            while [ $counter -lt $max_attempts ]; do
                # Check if web container is running
                web_running=$(docker inspect --format '{{.State.Running}}' jitsi-web 2>/dev/null || echo "false")
                
                if [ "$web_running" != "true" ]; then
                    echo "Container jitsi-web is not running!"
                    exit 1
                fi
                
                # Check if web service is responding
                if curl -f http://127.0.0.1:8000 2>/dev/null; then
                    echo "Jitsi web is responding!"
                    
                    # Check prosody
                    prosody_running=$(docker inspect --format '{{.State.Running}}' jitsi-prosody 2>/dev/null || echo "false")
                    if [ "$prosody_running" != "true" ]; then
                        echo "Container jitsi-prosody is not running!"
                        exit 1
                    fi
                    
                    # Check jicofo
                    jicofo_running=$(docker inspect --format '{{.State.Running}}' jitsi-jicofo 2>/dev/null || echo "false")
                    if [ "$jicofo_running" != "true" ]; then
                        echo "Container jitsi-jicofo is not running!"
                        exit 1
                    fi
                    
                    # Check jvb
                    jvb_running=$(docker inspect --format '{{.State.Running}}' jitsi-jvb 2>/dev/null || echo "false")
                    if [ "$jvb_running" != "true" ]; then
                        echo "Container jitsi-jvb is not running!"
                        exit 1
                    fi
                    
                    echo "All Jitsi services are healthy and running!"
                    exit 0
                fi
                
                echo "Jitsi not ready yet. Retrying in ${sleep_time}s... ($((counter+1))/$max_attempts)"
                sleep $sleep_time
                counter=$((counter+1))
            done
            
            echo "Timeout: Jitsi services did not become healthy within ${timeout}s."
            echo "=== jitsi-web logs ==="
            docker logs --tail 50 jitsi-web
            echo "=== jitsi-prosody logs ==="
            docker logs --tail 50 jitsi-prosody
            echo "=== jitsi-jicofo logs ==="
            docker logs --tail 50 jitsi-jicofo
            echo "=== jitsi-jvb logs ==="
            docker logs --tail 50 jitsi-jvb
            exit 1
        '''
    }
}

return this
