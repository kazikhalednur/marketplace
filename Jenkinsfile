pipeline {
    agent any

    stages {
        stage('Initialize') {
            steps {
                script {
                    echo "=========================================="
                    echo "Marketplace CI/CD Pipeline - Full Deployment"
                    echo "=========================================="
                    echo "Branch: ${env.BRANCH_NAME ?: 'N/A'}"
                    echo "Build Number: ${env.BUILD_NUMBER}"
                    echo "Mode: Deploy All Services"
                    echo "=========================================="
                }
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

        stage('Deploy All Services') {
            parallel {
                stage('Postgres') {
                    steps {
                        script {
                            echo "Deploying Postgres..."
                            def postgres = load 'database/staging/postgres/pipeline.groovy'
                            postgres()
                        }
                    }
                }

                stage('Redis') {
                    steps {
                        script {
                            echo "Deploying Redis..."
                            def redis = load 'database/staging/redis/pipeline.groovy'
                            redis()
                        }
                    }
                }

                stage('Mailcatcher') {
                    steps {
                        script {
                            echo "Deploying Mailcatcher..."
                            def mailcatcher = load 'mailcatcher/pipeline.groovy'
                            mailcatcher()
                        }
                    }
                }

                stage('Minio') {
                    steps {
                        script {
                            echo "Deploying MinIO..."
                            def minio = load 'minio/staging/pipeline.groovy'
                            minio()
                        }
                    }
                }

                stage('Jitsi') {
                    steps {
                        script {
                            echo "Deploying Jitsi..."
                            def jitsi = load 'jitsi/compose/staging/pipeline.groovy'
                            jitsi()
                        }
                    }
                }

                stage('Server') {
                    steps {
                        script {
                            echo "Deploying Server..."
                            def server = load 'server/compose/staging/pipeline.groovy'
                            server()
                        }
                    }
                }

                stage('Client') {
                    steps {
                        script {
                            echo "Deploying Client..."
                            def client = load 'client/compose/staging/pipeline.groovy'
                            client()
                        }
                    }
                }

                stage('NGINX') {
                    steps {
                        script {
                            echo "Deploying NGINX..."
                            def nginx = load 'nginx/compose/staging/pipeline.groovy'
                            nginx()
                        }
                    }
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

    post {
        success {
            echo "=========================================="
            echo "✓ All services deployed successfully!"
            echo "=========================================="
        }
        failure {
            echo "=========================================="
            echo "✗ Deployment failed. Check logs above."
            echo "=========================================="
        }
    }
}
