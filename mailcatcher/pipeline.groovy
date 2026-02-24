def call() {

    stage('Deploy') {
        sh 'docker compose -f mailcatcher/compose.staging.yaml up -d'
    }

    stage('Health Check') {
        sh '''
            timeout=30
            sleep_time=2
            counter=0
            max_attempts=$((timeout/sleep_time))
            
            echo "Waiting for staging-mailcatcher to be healthy..."
            
            while [ $counter -lt $max_attempts ]; do
                status=$(docker inspect --format '{{.State.Health.Status}}' staging-mailcatcher 2>/dev/null || echo "not-found")
                
                if [ "$status" = "healthy" ]; then
                    echo "Container staging-mailcatcher is healthy!"
                    exit 0
                fi
                
                echo "Status: $status. Retrying in ${sleep_time}s... ($((counter+1))/$max_attempts)"
                sleep $sleep_time
                counter=$((counter+1))
            done
            
            echo "Timeout: staging-mailcatcher did not become healthy."
            exit 1
        '''
    }
}

return this
