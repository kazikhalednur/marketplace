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
          env.POSTGRES_CHANGED  = changes.any { it.startsWith('database/staging/postgres/')  }.toString()
          env.REDIS_CHANGED  = changes.any { it.startsWith('database/staging/redis/')  }.toString()
          env.MAILCATCHER_CHANGED  = changes.any { it.startsWith('mailcatcher/')  }.toString()
        }
      }
    }

    stage('Build staging server') {
      when { expression { env.SERVER_CHANGED == 'true' } }
      steps {
        build job: 'staging-server-pipeline'
      }
    }

    stage('Build staging client') {
      when { expression { env.CLIENT_CHANGED == 'true' } }
      steps {
        build job: 'staging-client-pipeline'
      }
    }

    stage('Build staging s3') {
      when { expression { env.S3_CHANGED == 'true' } }
      steps {
        build job: 'staging-s3-pipeline'
      }
    }

    stage('Build staging jitsi') {
      when { expression { env.JITSI_CHANGED == 'true' } }
      steps {
        build job: 'staging-jitsi-pipeline'
      }
    }

    stage('Build staging postgres') {
      when { expression { env.POSTGRES_CHANGED == 'true' } }
      steps {
        build job: 'staging-postgres-pipeline'
      }
    }

    stage('Build staging redis') {
      when { expression { env.REDIS_CHANGED == 'true' } }
      steps {
        build job: 'staging-redis-pipeline'
      }
    }

    stage('Build staging mailcatcher') {
      when { expression { env.MAILCATCHER_CHANGED == 'true' } }
      steps {
        build job: 'staging-mailcatcher-pipeline'
      }
    }
  }
}
