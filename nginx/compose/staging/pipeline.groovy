def call() {

    stage('Checkout') {
        checkout scm
    }

    stage('Prepare SSL Certificates') {
        withCredentials([
            file(credentialsId: 'gpg-private-key', variable: 'GPG_KEY'),
            string(credentialsId: 'gpg-passphrase', variable: 'GPG_PASSPHRASE')
        ]) {
            sh '''
                cd ssl
                export GNUPGHOME=$(mktemp -d)
                gpg --batch --import "$GPG_KEY"

                if [ -f cpchub_diu_edu_bd.crt.gpg ]; then
                    gpg --batch --yes \
                        --pinentry-mode loopback \
                        --passphrase "$GPG_PASSPHRASE" \
                        --decrypt cpchub_diu_edu_bd.crt.gpg > cpchub_diu_edu_bd.crt
                    
                    echo "SSL certificate decrypted successfully"
                fi

                if [ -f cpchub_diu_edu_bd.key.gpg ]; then
                    gpg --batch --yes \
                        --pinentry-mode loopback \
                        --passphrase "$GPG_PASSPHRASE" \
                        --decrypt cpchub_diu_edu_bd.key.gpg > cpchub_diu_edu_bd.key
                    
                    chmod 600 cpchub_diu_edu_bd.key
                    
                    echo "SSL private key decrypted successfully"
                fi

                ls -la cpchub_diu_edu_bd.{crt,key}
            '''
        }
    }

    stage('Validate NGINX Configuration') {
        sh '''
            echo "=========================================="
            echo "Validating NGINX configuration..."
            echo "=========================================="
            
            if [ ! -f nginx/nginx.conf ]; then
                echo "ERROR: nginx.conf not found!"
                exit 1
            fi
            
            if [ ! -d nginx/conf.d/staging ]; then
                echo "ERROR: conf.d/staging directory not found!"
                exit 1
            fi
            
            echo "Required configuration files exist."
            
            cd nginx
            docker build -t nginx-validation-temp -f compose/staging/Dockerfile .
            
            if docker run --rm nginx-validation-temp nginx -t; then
                echo "=========================================="
                echo "✓ NGINX configuration is valid!"
                echo "=========================================="
            else
                echo "=========================================="
                echo "✗ NGINX configuration validation FAILED!"
                echo "=========================================="
                docker rmi nginx-validation-temp || true
                exit 1
            fi
            
            docker rmi nginx-validation-temp || true
        '''
    }

    stage('Create Logs Directory') {
        sh '''
            mkdir -p nginx/logs
            chmod 755 nginx/logs
        '''
    }

    stage('Deploy') {
        sh '''
            echo "=========================================="
            echo "Deploying NGINX reverse proxy..."
            echo "=========================================="
            
            docker compose -f nginx/compose.staging.yaml up --build -d
            
            echo "NGINX deployment initiated"
        '''
    }

    stage('Health Check') {
        sh '''
            timeout=60
            sleep_time=3
            counter=0
            max_attempts=$((timeout/sleep_time))
            
            echo "=========================================="
            echo "Waiting for staging-marketplace-nginx to be healthy..."
            echo "=========================================="
            
            while [ $counter -lt $max_attempts ]; do
                is_running=$(docker inspect --format '{{.State.Running}}' staging-marketplace-nginx 2>/dev/null || echo "false")
                
                if [ "$is_running" != "true" ]; then
                    echo "✗ Container staging-marketplace-nginx is not running!"
                    docker logs --tail 50 staging-marketplace-nginx 2>/dev/null || true
                    exit 1
                fi
                
                status=$(docker inspect --format '{{.State.Health.Status}}' staging-marketplace-nginx 2>/dev/null || echo "no-healthcheck")
                
                if [ "$status" = "healthy" ]; then
                    echo "=========================================="
                    echo "✓ Container staging-marketplace-nginx is healthy!"
                    echo "=========================================="
                    
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
                        echo "=========================================="
                        echo "✓ NGINX is responding to health checks!"
                        echo "=========================================="
                        exit 0
                    fi
                fi
                
                echo "Status: $status (running: $is_running). Retrying in ${sleep_time}s... ($((counter+1))/$max_attempts)"
                sleep $sleep_time
                counter=$((counter+1))
            done
            
            echo "=========================================="
            echo "✗ Timeout: staging-marketplace-nginx did not become healthy within ${timeout}s"
            echo "=========================================="
            
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
