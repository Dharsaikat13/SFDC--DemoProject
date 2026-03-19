pipeline {
    agent any

    environment {
        SF_USERNAME     = credentials('sfdc_user')
        SF_CONSUMER_KEY = credentials('consumer_key')
        SF_CLI          = 'C:/Program Files/sf/bin/sf.cmd'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Dharsaikat13/SFDC--DemoProject.git'
            }
        }

        stage('Check for Changes') {
    steps {
        script {
            def changes = bat(
                script: 'git diff --name-only HEAD~1 HEAD',
                returnStdout: true
            ).trim()

            if (changes) {
                echo "✅ Changes detected:\n${changes}"
            } else {
                echo "⚠️ No changes detected. Skipping deployment..."
                currentBuild.result = 'SUCCESS'
                error('Stopping pipeline as no changes were found.')
            }
        }
    }
}

        stage('Authenticate Salesforce') {
            steps {
                withCredentials([file(credentialsId: 'jwt_key', variable: 'JWT_KEY_FILE')]) {
                    bat """
                    "%SF_CLI%" org login jwt ^
                    --client-id %SF_CONSUMER_KEY% ^
                    --jwt-key-file "%JWT_KEY_FILE%" ^
                    --username %SF_USERNAME% ^
                    --instance-url https://login.salesforce.com ^
                    --alias projectdemosfdc
                    """
                }
            }
        }

        stage('Validate Deployment') {
         steps {
          bat """
          "%SF_CLI%" deploy metadata ^
          --target-org projectdemosfdc ^
          --dry-run ^
          --wait 10
          """
    }
}

        stage('Deploy to Org') {
            steps {
                bat """
                "%SF_CLI%" deploy metadata ^
                --target-org projectdemosfdc ^
                --wait 10
                """
            }
        }

        stage('Post Deployment Check') {
        steps {
        bat """
        "%SF_CLI%" org display ^
        --target-org projectdemosfdc
        """
    }
}

stage('Backup Metadata') {
    steps {
        bat """
        "%SF_CLI%" retrieve metadata ^
        --target-org projectdemosfdc ^
        --manifest manifest/package.xml ^
        --wait 10
        """
    }
}



    }

    post {
        success {
            echo '✅ Salesforce deployment and tests completed successfully'
        }
        failure {
            echo '❌ Pipeline failed. Check logs above for details.'
        }
    }
}