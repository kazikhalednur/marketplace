def call() {

    stage('Create env file') {
        withCredentials([
            file(credentialsId: 'gpg-private-key', variable: 'GPG_KEY'),
            string(credentialsId: 'gpg-passphrase', variable: 'GPG_PASSPHRASE')
        ]) {
            sh '''
                export GNUPGHOME=$(mktemp -d)

                gpg --batch --import "$GPG_KEY"

                gpg --batch --yes \
                    --pinentry-mode loopback \
                    --passphrase "$GPG_PASSPHRASE" \
                    --decrypt jitsi/compose/staging/.env.gpg > jitsi/.env
            '''
        }
    }

    stage('decrypt certificate files') {
        withCredentials([
            file(credentialsId: 'gpg-private-key', variable: 'GPG_KEY'),
            string(credentialsId: 'gpg-passphrase', variable: 'GPG_PASSPHRASE')
        ]) {
            sh '''
                export GNUPGHOME=$(mktemp -d)

                gpg --batch --import "$GPG_KEY"

                gpg --batch --yes \
                    --pinentry-mode loopback \
                    --passphrase "$GPG_PASSPHRASE" \
                    --decrypt ssl/cpchub_diu_edu_bd.crt.gpg > jitsi/web/keys/cert.crt

                gpg --batch --yes \
                    --pinentry-mode loopback \
                    --passphrase "$GPG_PASSPHRASE" \
                    --decrypt ssl/cpchub_diu_edu_bd.key.gpg > jitsi/web/keys/cert.key

                chmod 600 jitsi/web/keys/cert.key
            '''
        }
    }

    stage('Deploy') {
        sh '''
            docker compose -f jitsi/docker-compose.yml --env-file jitsi/.env up --build -d
        '''
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
                web_running=$(docker inspect --format '{{.State.Running}}' jitsi-web-1 2>/dev/null || echo "false")
                
                if [ "$web_running" != "true" ]; then
                    echo "Container jitsi-web-1 is not running!"
                    exit 1
                fi
                
                # Check if web service is responding
                if curl -f -s -o /dev/null http://127.0.0.1:8001 2>/dev/null; then
                    echo "Jitsi web is responding!"
                    
                    # Check prosody
                    prosody_running=$(docker inspect --format '{{.State.Running}}' jitsi-prosody-1 2>/dev/null || echo "false")
                    if [ "$prosody_running" != "true" ]; then
                        echo "Container jitsi-prosody-1 is not running!"
                        exit 1
                    fi
                    
                    # Check jicofo
                    jicofo_running=$(docker inspect --format '{{.State.Running}}' jitsi-jicofo-1 2>/dev/null || echo "false")
                    if [ "$jicofo_running" != "true" ]; then
                        echo "Container jitsi-jicofo-1 is not running!"
                        exit 1
                    fi
                    
                    # Check jvb
                    jvb_running=$(docker inspect --format '{{.State.Running}}' jitsi-jvb-1 2>/dev/null || echo "false")
                    if [ "$jvb_running" != "true" ]; then
                        echo "Container jitsi-jvb-1 is not running!"
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
            echo "=== jitsi-web-1 logs ==="
            docker logs --tail 50 jitsi-web-1
            echo "=== jitsi-prosody-1 logs ==="
            docker logs --tail 50 jitsi-prosody-1
            echo "=== jitsi-jicofo-1 logs ==="
            docker logs --tail 50 jitsi-jicofo-1
            echo "=== jitsi-jvb-1 logs ==="
            docker logs --tail 50 jitsi-jvb-1
            exit 1
        '''
    }
}

return this
