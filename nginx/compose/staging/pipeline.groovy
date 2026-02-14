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

                # Verify the decrypted files exist before listing
                if [ -f cpchub_diu_edu_bd.crt ] && [ -f cpchub_diu_edu_bd.key ]; then
                    ls -la cpchub_diu_edu_bd.crt cpchub_diu_edu_bd.key
                    echo "✓ SSL certificate files ready"
                else
                    echo "ERROR: SSL certificate files not found after decryption"
                    echo "Expected files: cpchub_diu_edu_bd.crt and cpchub_diu_edu_bd.key"
                    echo "Current directory contents:"
                    ls -la
                    exit 1
                fi
            '''
        }
    }

    stage('Validate NGINX Configuration') {
        sh '''
            echo "=========================================="
            echo "Validating NGINX configuration..."
            echo "=========================================="
            
            if [ ! -f nginx/nginx.conf ]; then
                echo "✗ ERROR: nginx.conf not found!"
                exit 1
            fi
            echo "✓ nginx.conf found"
            
            if [ ! -d nginx/conf.d/staging ]; then
                echo "✗ ERROR: conf.d/staging directory not found!"
                exit 1
            fi
            echo "✓ conf.d/staging directory found"
            
            if [ ! -f ssl/cpchub_diu_edu_bd.crt ] || [ ! -f ssl/cpchub_diu_edu_bd.key ]; then
                echo "✗ ERROR: SSL certificate files not found in ssl/ directory!"
                echo "Required files: cpchub_diu_edu_bd.crt and cpchub_diu_edu_bd.key"
                exit 1
            fi
            echo "✓ SSL certificates found"
            
            echo ""
            echo "Staging configuration files:"
            ls -1 nginx/conf.d/staging/
            
            # Verify networks exist
            echo ""
            echo "Checking required Docker networks..."
            for network in staging-marketplace-backend staging-marketplace staging-public; do
                if docker network inspect "$network" >/dev/null 2>&1; then
                    echo "✓ Network '$network' exists"
                else
                    echo "✗ ERROR: Network '$network' not found!"
                    exit 1
                fi
            done
            
            echo ""
            echo "Building validation container..."
            cd nginx
            docker build -t nginx-validation-temp -f compose/staging/Dockerfile .
            
            echo ""
            echo "Running NGINX configuration test with network connectivity..."
            if docker run --rm \
                --network staging-marketplace \
                --network staging-marketplace-backend \
                -v "$(pwd)/../ssl:/etc/nginx/ssl:ro" \
                -e TZ=Asia/Dhaka \
                -e ENVIRONMENT=staging \
                nginx-validation-temp nginx -t 2>&1 | tee /tmp/nginx-validation.log; then
                
                # Check if there were any warnings about upstream hosts
                if grep -q "host not found in upstream" /tmp/nginx-validation.log; then
                    echo ""
                    echo "⚠ WARNING: Some upstream hosts are not yet available"
                    echo "This is expected if services haven't been deployed yet"
                    echo "NGINX will start but upstream services must be running for full functionality"
                else
                    echo ""
                    echo "=========================================="
                    echo "✓ NGINX configuration is valid!"
                    echo "=========================================="
                fi
            else
                echo ""
                echo "=========================================="
                echo "✗ NGINX configuration validation FAILED!"
                echo "=========================================="
                cat /tmp/nginx-validation.log || true
                docker rmi nginx-validation-temp || true
                exit 1
            fi
            
            rm -f /tmp/nginx-validation.log
            docker rmi nginx-validation-temp || true
            echo "✓ Validation container removed"
        '''
    }

    stage('Create Logs Directory') {
        sh '''
            mkdir -p nginx/logs
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
