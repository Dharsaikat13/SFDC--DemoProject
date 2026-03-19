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
          --check-only ^
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

<<<<<<< HEAD
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
        --target-org projectdemosfdc
        """
    }
}



=======
        
    
>>>>>>> 5c6f1e02e32e6d3243beb17feee12533c792e726
    }

    post {
        success {
            echo '✅ Salesforce deployment completed successfully'
        }
        failure {
            echo '❌ Pipeline failed. Check logs above for details.'
        }
    }
}
