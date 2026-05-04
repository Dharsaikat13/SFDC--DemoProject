pipeline {
    agent any

    // No pollSCM here — Multibranch scans handle triggering
    triggers {
        pollSCM('H/1 * * * *')
    }

    environment {
        SF_USERNAME     = credentials('sfdc_user')
        SF_CONSUMER_KEY = credentials('consumer_key')
        SF_CLI          = 'C:/Program Files/sf/bin/sf.cmd'
    }

    stages {

        stage('PR Approval Check') {
            steps {
                script {
                    // CHANGE_ID is only set for PR builds in Multibranch
                    if (!env.CHANGE_ID) {
                        echo "Not a PR build — this is a direct branch build"
                        // Allow direct branch builds to proceed
                        // OR block them: error('Only PR builds allowed')
                        return
                    }

                    echo "PR #${env.CHANGE_ID} detected — checking for approval..."

                    def approved = false
                    withCredentials([string(credentialsId: 'github-token', variable: 'TOKEN')]) {
                        def response = bat(
                            script: """
                            curl -s -H "Authorization: token %TOKEN%" ^
                            https://api.github.com/repos/Dharsaikat13/SFDC--DemoProject/pulls/%CHANGE_ID%/reviews
                            """,
                            returnStdout: true
                        ).trim()

                        // Strip Windows bat header lines before parsing JSON
                        def jsonStart = response.indexOf('[')
                        def jsonText  = response.substring(jsonStart)
                        def reviews   = readJSON text: jsonText

                        for (def r : reviews) {
                            if (r.state == 'APPROVED') {
                                approved = true
                                break
                            }
                        }
                    }

                    if (!approved) {
                        echo "PR #${env.CHANGE_ID} is NOT approved — blocking deploy"
                        currentBuild.result = 'ABORTED'
                        error("PR must be approved before deploying")
                    }

                    echo "PR #${env.CHANGE_ID} is APPROVED — proceeding"
                }
            }
        }

        stage('Code Checkout') {
            steps {
                checkout scm
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
            // Only deploy when targeting main
            when {
                expression { env.CHANGE_TARGET == 'main' || env.BRANCH_NAME == 'main' }
            }
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
        success { echo "Deployment successful" }
        failure { echo "Deployment failed" }
        always  { cleanWs() }
    }
}
