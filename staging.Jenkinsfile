pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
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

        stage('Run Services') {
            parallel {
                stage('Client') {
                    when { 
                        expression { 
                            def changedFiles = env.CHANGED.split('\n').findAll { it.trim() }
                            changedFiles.any { it.replaceFirst('^\\./','').startsWith('client/') }
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
                            def changedFiles = env.CHANGED.split('\n').findAll { it.trim() }
                            changedFiles.any { it.replaceFirst('^\\./','').startsWith('server/') }
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
                            def changedFiles = env.CHANGED.split('\n').findAll { it.trim() }
                            changedFiles.any { it.replaceFirst('^\\./','').startsWith('database/staging/postgres/') }
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
                            def changedFiles = env.CHANGED.split('\n').findAll { it.trim() }
                            changedFiles.any { it.replaceFirst('^\\./','').startsWith('database/staging/redis/') }
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
                            def changedFiles = env.CHANGED.split('\n').findAll { it.trim() }
                            changedFiles.any { it.replaceFirst('^\\./','').startsWith('mailcatcher/') }
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
                            def changedFiles = env.CHANGED.split('\n').findAll { it.trim() }
                            changedFiles.any { it.replaceFirst('^\\./','').startsWith('minio/staging/') }
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
                            def changedFiles = env.CHANGED.split('\n').findAll { it.trim() }
                            changedFiles.any { it.replaceFirst('^\\./','').startsWith('jitsi/') }
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
                            def changedFiles = env.CHANGED.split('\n').findAll { it.trim() }
                            changedFiles.any { it.replaceFirst('^\\./','').startsWith('nginx/') }
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
    }
}
