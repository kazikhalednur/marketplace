pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Create Docker Networks') {
            steps {
                script {
                    echo "=========================================="
                    echo "Creating Docker networks..."
                    echo "=========================================="
                    
                    sh '''
                        # Function to create network if it doesn't exist
                        create_network_if_not_exists() {
                            network_name=$1
                            network_flags=$2
                            
                            if docker network inspect "$network_name" >/dev/null 2>&1; then
                                echo "✓ Network '$network_name' already exists"
                            else
                                docker network create $network_flags "$network_name"
                                echo "✓ Network '$network_name' created"
                            fi
                        }
                        
                        # Create internal database network
                        create_network_if_not_exists "staging-marketplace-database" "--internal"
                        
                        # Create internal backend network
                        create_network_if_not_exists "staging-marketplace-backend" "--internal"
                        
                        # Create internal marketplace network
                        create_network_if_not_exists "staging-marketplace" "--internal"
                        
                        # Create public network
                        create_network_if_not_exists "staging-public" ""
                        
                        echo ""
                        echo "=========================================="
                        echo "✓ All networks ready"
                        echo "=========================================="
                        docker network ls | grep staging
                    '''
                }
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    // Determine if we're on main branch
                    def currentBranch = env.BRANCH_NAME ?: sh(
                        script: "git rev-parse --abbrev-ref HEAD",
                        returnStdout: true
                    ).trim()

                    echo "Current branch: ${currentBranch}"

                    def diffCommand
                    if (currentBranch == 'main') {
                        // On main: compare against previous commit to see what just changed
                        diffCommand = "git diff --name-only HEAD~1 HEAD"
                        echo "Building main branch - comparing HEAD~1 vs HEAD"
                    } else {
                        // On feature branch: compare against merge-base with main
                        // origin/main already exists from Jenkins checkout
                        def mergeBase = sh(
                            script: "git merge-base HEAD origin/main",
                            returnStdout: true
                        ).trim()
                        diffCommand = "git diff --name-only ${mergeBase} HEAD"
                        echo "Building feature branch - comparing against merge-base: ${mergeBase}"
                    }

                    env.CHANGED = sh(
                        script: diffCommand,
                        returnStdout: true
                    ).trim()

                    echo "Changed files:\n${env.CHANGED}"

                    // Normalize: filter out empty lines
                    def changedFiles = env.CHANGED.split('\n').findAll { it.trim() }
                    env.CHANGED_COUNT = changedFiles.size()
                    echo "Total changed files: ${env.CHANGED_COUNT}"
                }
            }
        }

        stage('Check Service Status') {
            steps {
                script {
                    echo "=========================================="
                    echo "Checking service status and determining build requirements..."
                    echo "=========================================="
                    
                    // Define services with their container names and folder paths
                    def services = [
                        [name: 'Client', container: 'staging-marketplace-client', folder: 'client/'],
                        [name: 'Server', container: 'staging-marketplace-server', folder: 'server/'],
                        [name: 'Postgres', container: 'staging-marketplace-postgres', folder: 'database/staging/postgres/'],
                        [name: 'Redis', container: 'staging-marketplace-redis', folder: 'database/staging/redis/'],
                        [name: 'Mailcatcher', container: 'staging-mailcatcher', folder: 'mailcatcher/'],
                        [name: 'Minio', container: 'staging-aistor-server', folder: 'minio/staging/'],
                        [name: 'Jitsi', container: 'staging-marketplace-jitsi', folder: 'jitsi/'],
                        [name: 'NGINX', container: 'staging-marketplace-nginx', folder: 'nginx/']
                    ]
                    
                    def changedFiles = env.CHANGED.split('\n').findAll { it.trim() }
                    
                    services.each { service ->
                        // Check if container is running
                        def isRunning = sh(
                            script: "docker ps --filter 'name=${service.container}' --filter 'status=running' --format '{{.Names}}' | grep -q '${service.container}' && echo 'true' || echo 'false'",
                            returnStdout: true
                        ).trim()
                        
                        // Check if folder has changes
                        def hasChanges = changedFiles.any { 
                            it.replaceFirst('^\\./','').startsWith(service.folder) 
                        }
                        
                        // Build logic: Always build if service is not running OR has changes
                        def needsBuild = (isRunning == 'false') || hasChanges
                        
                        // Set environment variable for this service
                        env."BUILD_${service.name.toUpperCase()}" = needsBuild.toString()
                        
                        // Log status with clear reasoning
                        def status = isRunning == 'true' ? '✓ Running' : '✗ Not Running'
                        def changeStatus = hasChanges ? '✓ Has Changes' : '○ No Changes'
                        
                        def buildReason = ''
                        if (isRunning == 'false') {
                            buildReason = '→ BUILD (Not Running)'
                        } else if (hasChanges) {
                            buildReason = '→ BUILD (Has Changes)'
                        } else {
                            buildReason = '○ Skip'
                        }
                        
                        echo "${service.name.padRight(15)} | ${status.padRight(15)} | ${changeStatus.padRight(15)} | ${buildReason}"
                    }
                    
                    echo "=========================================="
                }
            }
        }

        stage('Run Services') {
            parallel {
                stage('Client') {
                    when { 
                        expression { 
                            env.BUILD_CLIENT == 'true'
                        } 
                    }
                    steps {
                        script {
                            def client = load 'client/compose/staging/pipeline.groovy'
                            client()
                        }
                    }
                }

                stage('Server') {
                    when { 
                        expression { 
                            env.BUILD_SERVER == 'true'
                        } 
                    }
                    steps {
                        script {
                            def server = load 'server/compose/staging/pipeline.groovy'
                            server()
                        }
                    }
                }

                stage('Postgres') {
                    when { 
                        expression { 
                            env.BUILD_POSTGRES == 'true'
                        } 
                    }
                    steps {
                        script {
                            def postgres = load 'database/staging/postgres/pipeline.groovy'
                            postgres()
                        }
                    }
                }

                stage('Redis') {
                    when { 
                        expression { 
                            env.BUILD_REDIS == 'true'
                        } 
                    }
                    steps {
                        script {
                            def redis = load 'database/staging/redis/pipeline.groovy'
                            redis()
                        }
                    }
                }

                stage('Mailcatcher') {
                    when { 
                        expression { 
                            env.BUILD_MAILCATCHER == 'true'
                        } 
                    }
                    steps {
                        script {
                            def mailcatcher = load 'mailcatcher/pipeline.groovy'
                            mailcatcher()
                        }
                    }
                }

                stage('Minio') {
                    when { 
                        expression { 
                            env.BUILD_MINIO == 'true'
                        } 
                    }
                    steps {
                        script {
                            def minio = load 'minio/staging/pipeline.groovy'
                            minio()
                        }
                    }
                }

                stage('Jitsi') {
                    when { 
                        expression { 
                            env.BUILD_JITSI == 'true'
                        } 
                    }
                    steps {
                        script {
                            def jitsi = load 'jitsi/compose/staging/pipeline.groovy'
                            jitsi()
                        }
                    }
                }

                stage('NGINX') {
                    when { 
                        expression { 
                            env.BUILD_NGINX == 'true'
                        } 
                    }
                    steps {
                        script {
                            def nginx = load 'nginx/compose/staging/pipeline.groovy'
                            nginx()
                        }
                    }
                }
            }
        }

        stage('Restart NGINX After Changes') {
            when {
                expression {
                    // Check if any service (except NGINX) was built
                    def anyServiceBuilt = (
                        env.BUILD_CLIENT == 'true' ||
                        env.BUILD_SERVER == 'true' ||
                        env.BUILD_POSTGRES == 'true' ||
                        env.BUILD_REDIS == 'true' ||
                        env.BUILD_MAILCATCHER == 'true' ||
                        env.BUILD_MINIO == 'true' ||
                        env.BUILD_JITSI == 'true'
                    )
                    return anyServiceBuilt
                }
            }
            steps {
                script {
                    echo "=========================================="
                    echo "Restarting NGINX after service changes..."
                    echo "=========================================="
                    
                    sh '''
                        # Check if NGINX container exists
                        if docker ps -a --filter 'name=staging-marketplace-nginx' --format '{{.Names}}' | grep -q 'staging-marketplace-nginx'; then
                            echo "Restarting NGINX container..."
                            docker restart staging-marketplace-nginx
                            
                            # Wait for NGINX to be healthy
                            echo "Waiting for NGINX to be healthy..."
                            timeout=30
                            counter=0
                            
                            while [ $counter -lt $timeout ]; do
                                if docker inspect --format '{{.State.Health.Status}}' staging-marketplace-nginx 2>/dev/null | grep -q 'healthy'; then
                                    echo "✓ NGINX is healthy and ready"
                                    break
                                fi
                                
                                # If no healthcheck, just check if it's running
                                if docker inspect --format '{{.State.Running}}' staging-marketplace-nginx 2>/dev/null | grep -q 'true'; then
                                    if [ $counter -gt 5 ]; then
                                        echo "✓ NGINX is running"
                                        break
                                    fi
                                fi
                                
                                echo "Waiting... ($counter/$timeout)"
                                sleep 1
                                counter=$((counter+1))
                            done
                            
                            echo ""
                            echo "=========================================="
                            echo "✓ NGINX restarted successfully"
                            echo "=========================================="
                        else
                            echo "⚠ NGINX container not found - skipping restart"
                        fi
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    echo "=========================================="
                    echo "Verifying All Services..."
                    echo "=========================================="
                    
                    sh '''
                        echo "Running containers:"
                        docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}" | grep staging || true
                        
                        echo ""
                        echo "=========================================="
                        echo "✓ Full deployment complete!"
                        echo "=========================================="
                    '''
                }
            }
        }
    }
}
