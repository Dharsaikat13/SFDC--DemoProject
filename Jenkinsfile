pipeline {
    agent any

    parameters {
        choice(
            name: 'GIT_BRANCH',
            choices: ['main', 'develop'],
            description: 'Select the Git branch to build'
        )
    }
   triggers {
        pollSCM('H/1 * * * *')
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

         stage('Detect PR') {
            steps {
                script {

                    // Only run for PR builds
                    if (!env.CHANGE_ID) {
                        echo "Not a PR build → skipping"
                        currentBuild.result = 'NOT_BUILT'
                        return
                    }

                    echo "PR detected: ${env.CHANGE_ID}"

                    def approved = false

                    withCredentials([string(credentialsId: 'github-token', variable: 'TOKEN')]) {

                        def response = sh(
                            script: """
                            curl -s -H "Authorization: token $TOKEN" \
                            https://api.github.com/repos/Dharsaikat13/SFDC--DemoProject/pulls/${env.CHANGE_ID}/reviews
                            """,
                            returnStdout: true
                        ).trim()

                        def reviews = readJSON text: response

                        for (r in reviews) {
                            if (r.state == "APPROVED") {
                                approved = true
                            }
                        }
                    }

                    if (!approved) {
                        echo "❌ PR NOT approved → skipping build"
                        currentBuild.result = 'NOT_BUILT'
                        return
                    }

                    echo "✅ PR APPROVED → continuing pipeline"
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
