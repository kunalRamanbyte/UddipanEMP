pipeline {
    agent {
        docker { 
            image 'mcr.microsoft.com/playwright:v1.40.0-jammy' 
        }
    }

    triggers {
        // Run daily at midnight
        cron('H 0 * * *')
    }

    environment {
        GEMINI_API_KEY = credentials('gemini-api-key')
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                sh 'npx playwright install-deps'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Run Tests') {
            steps {
                // Generate data if needed, or use existing
                sh 'node scripts/generate-data.js'
                // Run web tests
                sh 'npx ts-node web-engine/run-test.ts'
            }
        }
    }

    post {
        always {
            // Archive the HTML report
            archiveArtifacts artifacts: 'report.html', fingerprint: true
            
            // Requires "HTML Publisher" Plugin
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: '.',
                reportFiles: 'report.html',
                reportName: 'Automation Execution Report',
                reportTitles: ''
            ])
        }
        failure {
            echo "Automation failed! Check the report and console logs."
        }
    }
}
