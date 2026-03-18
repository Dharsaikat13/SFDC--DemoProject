pipeline {
    agent any

    environment {
        SF_USERNAME     = credentials('sfdc_user')
        SF_CONSUMER_KEY = credentials('consumer_key')
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
                withCredentials([file(credentialsId: 'jwt_key_file', variable: 'JWT_KEY_FILE')]) {
                    bat """
                    "C:\Program Files\sf\bin\sf.cmd" org login jwt ^
                    --client-id %SF_CONSUMER_KEY% ^
                    --jwt-key-file "%JWT_KEY_FILE%" ^
                    --username %SF_USERNAME% ^
                    --instance-url https://login.salesforce.com ^
                    --alias projectdemosfdc
                    """
                }
            }
        }

        stage('Deploy to Org') {
            steps {
                bat """
                "C:\\Program Files\\Salesforce CLI\\bin\\sf.cmd" project deploy start ^
                --source-dir force-app ^
                --target-org projectdemosfdc ^
                --wait 10
                """
            }
        }

        stage('Run Tests') {
            steps {
                bat """
                "C:\\Program Files\\Salesforce CLI\\bin\\sf.cmd" apex run test ^
                --target-org projectdemosfdc ^
                --wait 10 ^
                --result-format human
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