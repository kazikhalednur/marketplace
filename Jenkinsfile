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
                    CHANGED = sh(
                        script: "git diff --name-only origin/main...HEAD",
                        returnStdout: true
                    ).trim()
                }
            }
        }

        stage('Run Services') {
            parallel {
                // stage('Client') {
                //     when { expression { CHANGED.contains('client/') } }
                //     steps {
                //         script {
                //             def client = load 'client/pipeline.groovy'
                //             client.run()
                //         }
                //     }
                // }

                stage('Server') {
                    when { expression { CHANGED.contains('server/') } }
                    steps {
                        script {
                            def server = load 'server/compose/staging/pipline.groovy'
                            server.run()
                        }
                    }
                }

                stage('Postgres') {
                    when { expression { CHANGED.contains('database/staging/postgres/') } }
                    steps {
                        script {
                            def postgres = load 'database/staging/postgres/pipeline.groovy'
                            postgres.run()
                        }
                    }
                }

                stage('Redis') {
                    when { expression { CHANGED.contains('database/staging/redis/') } }
                    steps {
                        script {
                            def redis = load 'database/staging/redis/pipeline.groovy'
                            redis.run()
                        }
                    }
                }

                stage('Mailcatcher') {
                    when { expression { CHANGED.contains('mailcatcher/') } }
                    steps {
                        script {
                            def mailcatcher = load 'mailcatcher/pipeline.groovy'
                            mailcatcher.run()
                        }
                    }
                }
            }
        }
    }
}
