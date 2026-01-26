pipeline {
  agent any

  stages {
    stage('Detect changes') {
      steps {
        script {
          def changes = sh(
            script: "git diff --name-only origin/main...HEAD",
            returnStdout: true
          ).trim().split("\n")

          env.SERVER_CHANGED = changes.any { it.startsWith('server/') }.toString()
          env.CLIENT_CHANGED = changes.any { it.startsWith('client/') }.toString()
          env.S3_CHANGED  = changes.any { it.startsWith('s3/')  }.toString()
          env.JITSI_CHANGED  = changes.any { it.startsWith('jitsi/')  }.toString()
        }
      }
    }

    stage('Build server') {
      when { expression { env.SERVER_CHANGED == 'true' } }
      steps {
        build job: 'server-pipeline'
      }
    }

    stage('Build client') {
      when { expression { env.CLIENT_CHANGED == 'true' } }
      steps {
        build job: 'client-pipeline'
      }
    }

    stage('Build s3') {
      when { expression { env.S3_CHANGED == 'true' } }
      steps {
        build job: 's3-pipeline'
      }
    }

    stage('Build jitsi') {
      when { expression { env.JITSI_CHANGED == 'true' } }
      steps {
        build job: 'jitsi-pipeline'
      }
    }
  }
}
