def call() {

    stage('Prepare SSL Certificates') {
        withCredentials([
            file(credentialsId: 'gpg-private-key', variable: 'GPG_KEY'),
            string(credentialsId: 'gpg-passphrase', variable: 'GPG_PASSPHRASE')
        ]) {
            sh '''
                cd ssl
                export GNUPGHOME=$(mktemp -d)
                gpg --batch --import "$GPG_KEY"

                gpg --batch --yes \
                    --pinentry-mode loopback \
                    --passphrase "$GPG_PASSPHRASE" \
                    --decrypt server.crt.gpg > server.crt
                    
                echo "SSL certificate decrypted successfully"

                gpg --batch --yes \
                    --pinentry-mode loopback \
                    --passphrase "$GPG_PASSPHRASE" \
                    --decrypt server.key.gpg > server.key
                    
                chmod 600 server.key
                
                echo "SSL private key decrypted successfully"
            '''
        }
    }

    stage('Validate NGINX Configuration') {
        sh '''
            if [ -z "${SERVER_NAME:-}" ]; then
                echo "SERVER_NAME is not set. Define it in the Jenkins environment."
                exit 1
            fi

            cd nginx
            docker build -t nginx-validation-temp -f compose/staging/Dockerfile .
            
            if docker run --rm \
                --network staging-marketplace \
                --network staging-marketplace-backend \
                -v "$(pwd)/../ssl:/etc/nginx/ssl:ro" \
                -e TZ=Asia/Dhaka \
                -e ENVIRONMENT=staging \
                -e SERVER_NAME="$SERVER_NAME" \
                nginx-validation-temp nginx -t 2>&1 | tee /tmp/nginx-validation.log; then
                echo "✓ NGINX configuration is valid!"
            else
                echo "NGINX configuration validation FAILED!"
                cat /tmp/nginx-validation.log || true
                docker rmi nginx-validation-temp || true
                exit 1
            fi
            
            rm -f /tmp/nginx-validation.log
            docker rmi nginx-validation-temp || true
        '''
    }

    stage('Create Logs Directory') {
        sh '''
            mkdir -p nginx/logs
        '''
    }

    stage('Deploy') {
        sh '''
            docker compose -f compose.staging.yaml up --build -d nginx
        '''
    }

    stage('Health Check') {
        sh '''
            timeout=60
            sleep_time=3
            counter=0
            max_attempts=$((timeout/sleep_time))
            
            echo "Waiting for staging-marketplace-nginx to be healthy..."
            
            while [ $counter -lt $max_attempts ]; do
                is_running=$(docker inspect --format '{{.State.Running}}' staging-marketplace-nginx 2>/dev/null || echo "false")
                
                if [ "$is_running" != "true" ]; then
                    echo "✗ Container staging-marketplace-nginx is not running!"
                    docker logs --tail 50 staging-marketplace-nginx 2>/dev/null || true
                    exit 1
                fi
                
                status=$(docker inspect --format '{{.State.Health.Status}}' staging-marketplace-nginx 2>/dev/null || echo "no-healthcheck")
                
                if [ "$status" = "healthy" ]; then
                    echo "✓ Container staging-marketplace-nginx is healthy!"
                    docker ps | grep staging-marketplace-nginx
                    
                    if curl -f http://localhost:80/health 2>/dev/null; then
                        echo "✓ HTTP health endpoint responding"
                    fi
                    
                    if curl -f -k https://localhost:443/health 2>/dev/null; then
                        echo "✓ HTTPS health endpoint responding"
                    fi
                    
                    exit 0
                fi
                
                if [ "$status" = "no-healthcheck" ]; then
                    if curl -f http://localhost:80/health 2>/dev/null; then
                        echo "✓ NGINX is responding to health checks!"
                        exit 0
                    fi
                fi
                
                echo "Status: $status (running: $is_running). Retrying in ${sleep_time}s... ($((counter+1))/$max_attempts)"
                sleep $sleep_time
                counter=$((counter+1))
            done
            
            echo "✗ Timeout: staging-marketplace-nginx did not become healthy within ${timeout}s"
            
            echo "Container logs:"
            docker logs --tail 100 staging-marketplace-nginx
            
            exit 1
        '''
    }

    stage('Verify Services') {
        sh '''
            echo "=========================================="
            echo "Verifying NGINX proxy endpoints..."
            echo "=========================================="
            
            netstat -tlnp | grep -E ':(80|443|8443|8444|8445|8447|8448)' || true
            
            docker ps | grep staging-marketplace-nginx
            
            echo "=========================================="
            echo "✓ NGINX reverse proxy deployment complete!"
            echo "=========================================="
        '''
    }
}

return this
