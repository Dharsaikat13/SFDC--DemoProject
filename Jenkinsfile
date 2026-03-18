pipeline {

    agent any
 
    options {

        skipDefaultCheckout()

    }
 
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

                withCredentials([file(credentialsId: 'jwt_key', variable: 'JWT_KEY_FILE')]) {

                    bat """

                    sf org login jwt ^

                    --client-id %SF_CONSUMER_KEY% ^

                    --jwt-key-file %JWT_KEY_FILE% ^

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

                sf project deploy start ^

                --source-dir force-app ^

                --target-org projectdemosfdc ^

                --wait 10

                """

            }

        }
 
        stage('Run Tests') {

            steps {

                bat """

                sf apex run test ^

                --target-org projectdemosfdc ^

                --wait 10 ^

                --result-format human

                """

            }

        }

    }

}

 