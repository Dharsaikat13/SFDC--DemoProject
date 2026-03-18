pipeline {
    agent any

    environment {
        SF_USERNAME = credentials('sfdc_user')
        SF_CONSUMER_KEY = credentials('consumer_key')
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                git 'https://github.com/Dharsaikat13/SFDC--DemoProject.git'
            }
        }

        stage('Authenticate Salesforce') {
            steps {
                sh '''
                sf force:auth:jwt:grant \
                --client-id $SF_CONSUMER_KEY \
                --jwt-key-file server.key \
                --username $SF_USERNAME \
                --instance-url https://login.salesforce.com \
                --set-default-dev-hub \
                --alias projectdemosfdc
                '''
            }
        }

        stage('Deploy to Org') {
            steps {
                sh '''
                sf project deploy start \
                --source-dir force-app \
                --target-org $SF_USERNAME \
                --wait 10
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                sf apex run test \
                --target-org $SF_USERNAME \
                --wait 10 \
                --result-format human
                '''
            }
        }
    }
}