pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Create env file') {
            steps {
                withCredentials([
                    file(credentialsId: 'gpg-private-key', variable: 'GPG_KEY'),
                    string(credentialsId: 'gpg-passphrase', variable: 'GPG_PASSPHRASE')
                ]) {
                    sh '''
                        cd server/compose/staging
                        
                        export GNUPGHOME=$(mktemp -d)

                        gpg --batch --import "$GPG_KEY"

                        gpg --batch --yes \
                            --pinentry-mode loopback \
                            --passphrase "$GPG_PASSPHRASE" \
                            --decrypt .env.gpg > .env
                    '''
                }
            }
        }

        stage('Build and Deploy') {
            steps {
                sh 'docker compose -f server/compose.staging.yaml up --build -d'
            }
        }
    }
}
