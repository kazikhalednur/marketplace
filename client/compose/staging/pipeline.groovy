def call() {

    stage('Checkout') {
        checkout scm
    }

    stage('Create env file') {
        withCredentials([
            file(credentialsId: 'gpg-private-key', variable: 'GPG_KEY'),
            string(credentialsId: 'gpg-passphrase', variable: 'GPG_PASSPHRASE')
        ]) {
            sh '''
                cd client/compose/staging

                export GNUPGHOME=$(mktemp -d)

                gpg --batch --import "$GPG_KEY"

                gpg --batch --yes \
                    --pinentry-mode loopback \
                    --passphrase "$GPG_PASSPHRASE" \
                    --decrypt .env.gpg > .env
            '''
        }
    }

    stage('Build and Deploy') {
        sh 'docker compose -f client/compose.staging.yaml up --build -d'
    }
}

return this
