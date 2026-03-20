pipeline {
    agent any

    parameters {
        choice(
            name: 'GIT_BRANCH',
            choices: ['main', 'develop'],
            description: 'Select the Git branch to build'
        )
    }

    environment {
        SF_USERNAME     = credentials('sfdc_user')
        SF_CONSUMER_KEY = credentials('consumer_key')
        SF_CLI          = 'C:/Program Files/sf/bin/sf.cmd'
    }

    stages {

        stage('Code Checkout') {
            steps {
                echo "Checking out branch: ${params.GIT_BRANCH}"
                git branch: "${params.GIT_BRANCH}",
                    url: 'https://github.com/Dharsaikat13/SFDC--DemoProject.git'
            }
        }

        stage('Install Salesforce CLI Plugins') {
            steps {
                bat """
                echo Installing Salesforce CLI plugins
                "%SF_CLI%" plugins install @salesforce/plugin-deploy-retrieve
                "%SF_CLI%" plugins install sfdx-git-delta
                """
            }
        }

        stage('Authorization to Org') {
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
    }

    post {
        success {
            echo "Deployment successful for branch ${params.GIT_BRANCH}"
        }
        failure {
            echo "Deployment failed for branch ${params.GIT_BRANCH}"
        }
    }
}