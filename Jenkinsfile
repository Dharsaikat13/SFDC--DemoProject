pipeline {
    agent any

    triggers {
        pollSCM('H/1 * * * *')
    }

    environment {
        SF_USERNAME     = credentials('sfdc_user')
        SF_CONSUMER_KEY = credentials('consumer_key')
        SF_CLI          = 'C:/Program Files/sf/bin/sf.cmd'
        GITHUB_REPO     = 'Dharsaikat13/SFDC--DemoProject'
    }

    stages {

        stage('Skip CI check') {
            steps {
                script {
                    def msg = bat(
                        script: '@git log -1 --pretty=%%B',
                        returnStdout: true
                    ).trim()
                    echo "Last commit message: ${msg}"

                    if (msg.contains('[skip ci]')) {
                        currentBuild.result = 'NOT_BUILT'
                        error('CI bot commit — skipping pipeline')
                    }
                }
            }
        }

        stage('PR Approval Check') {
            steps {
                script {
                    // Read the last commit message
                    def commitMsg = bat(
                        script: '@git log -1 --pretty=%%B',
                        returnStdout: true
                    ).trim()

                    echo "Commit: ${commitMsg}"

                    // Extract PR number from "Merge pull request #N from ..."
                    def prMatch = commitMsg =~ /Merge pull request #(\d+)/
                    if (!prMatch) {
                        echo "Not a PR merge commit — skipping approval check"
                        return
                    }

                    def prNumber = prMatch[0][1]
                    echo "Detected PR #${prNumber} — checking approval status on GitHub..."

                    def approved = false
                    withCredentials([string(credentialsId: 'github-token', variable: 'GH_TOKEN')]) {
                        def response = bat(
                            script: """
                            @curl -s ^
                              -H "Authorization: token %GH_TOKEN%" ^
                              -H "Accept: application/vnd.github.v3+json" ^
                              https://api.github.com/repos/%GITHUB_REPO%/pulls/${prNumber}/reviews
                            """,
                            returnStdout: true
                        ).trim()

                        echo "GitHub API raw response: ${response}"

                        // Parse JSON response
                        def reviews = readJSON text: response
                        echo "Total reviews found: ${reviews.size()}"

                        for (def review : reviews) {
                            echo "Review by ${review.user.login}: ${review.state}"
                            if (review.state == 'APPROVED') {
                                approved = true
                                echo "APPROVED by: ${review.user.login}"
                            }
                        }
                    }

                    if (!approved) {
                        currentBuild.result = 'ABORTED'
                        error("PR #${prNumber} was NOT approved — blocking deploy")
                    }

                    echo "PR #${prNumber} is APPROVED — proceeding to deploy"
                }
            }
        }

        stage('Code Checkout') {
            steps {
                checkout scm
                echo "Checked out: ${env.GIT_COMMIT}"
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
            echo "Deployment successful to Salesforce"
        }
        failure {
            echo "Deployment failed — check console output"
        }
        aborted {
            echo "Pipeline aborted — PR was not approved"
        }
        always {
            cleanWs()
        }
    }
}
