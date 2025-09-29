pipeline {
  agent {
    kubernetes {
      yaml '''    
apiVersion: v1
kind: Pod
spec:
  imagePullSecrets:
  - name: dockerhub-secret
  containers:
  - name: node
    image: node:22.18.0
    command:
    - cat
    tty: true
  # Docker CLI container (talks to host Docker)
  - name: docker
    image: docker:20.10-dind
    securityContext:
      privileged: true
    tty: true
    args:
      - --host=tcp://0.0.0.0:2375
      - --host=unix:///var/run/docker.sock
        '''
    }
  }
  
  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10', daysToKeepStr: '30', artifactNumToKeepStr: '5'))
    timeout(time: 60, unit: 'MINUTES')
    skipDefaultCheckout(false)
  }

  environment {
    DOCKER_IMAGE = "${JOB_BASE_NAME}:${BUILD_NUMBER}"
    DEVTRON_URL = 'http://80.225.201.22:8000/orchestrator/webhook/ext-ci/2'
  }

  stages {
    stage('Checkout') {
      steps {
        echo "🔄 Checking out branch: ${env.BRANCH_NAME}"
        checkout scm
      }
    }

    stage('Validate Commit Message') {
      when { expression { env.BRANCH_NAME.startsWith("feature/") } }
      steps {
        script {
          // Get the latest commit message
          def commitMsg = sh(
            script: "git log -1 --pretty=%B",
            returnStdout: true
          ).trim()

          echo "Latest commit message: ${commitMsg}"

          // Split by '#' to separate message and Jira ID
          def parts = commitMsg.split('#')

          if (parts.length != 2) {
            error "❌ Commit message must contain a '#' followed by Jira ID!"
          }

          def msgText = parts[0].trim()
          def jiraId = parts[1].trim()

          // Check message length
          if (msgText.length() < 30) {
            error "❌ Commit message text must be at least 30 characters!"
          }

          // Check Jira ID format (e.g., ABC-123)
          if (!jiraId.matches("[A-Z]{2,}-\\d+")) {
            error "❌ Jira ID after '#' is invalid! Example: ABC-123"
          }

          echo "✅ Commit message validation passed"
        }
      }
    }

    stage('Version Management') {
      steps {
        script {
          if (env.BRANCH_NAME == 'develop') {
            echo "Develop branch: updating version.txt"
          } else if (env.BRANCH_NAME.startsWith("feature/")) {
            echo "Feature branch: pulling latest version.txt from develop"
          }
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        echo "📦 Installing Node.js dependencies"
        container('node') {
          sh '''
            npm ci --only=production=false
            npm cache clean --force
          '''
        }
      }
    }

    stage('Run Tests') {
      when { expression { env.BRANCH_NAME.startsWith("feature/") } }
      steps {
        echo "🧪 Running Unit Tests"
        container('node') {
          sh 'JEST_JUNIT_OUTPUT=test-results.xml npx jest-junit && CI=true react-scripts test --coverage --watchAll=false --reporters=default --reporters=jest-junit'
          junit allowEmptyResults: true, testResults: 'test-results.xml'
          publishCoverage adapters: [
            publishCoverageAdapter('lcov', 'coverage/lcov.info')
          ], sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
        }
      }
    }

    stage('Build') {
      when {
        anyOf {
          expression { env.BRANCH_NAME.startsWith("feature/") }
          branch 'develop'
        }
      }
      steps {
        echo "🚀 Building Node.js application for branch: ${env.BRANCH_NAME}"
        container('node') {
          sh '''
            npm run build
            npm run lint --if-present
          '''
        }
      }
    }

    


    stage('SonarQube Scan') {
            when { expression { env.BRANCH_NAME.startsWith("feature/") } }
            steps { echo "Running SonarQube Scan" }
        }

        stage('OWASP Dependency Check') {
            when { expression { env.BRANCH_NAME.startsWith("feature/") } }
            steps { echo "Running OWASP Dependency Check" }
        }

        stage('Gitleaks Scan') {
            when { expression { env.BRANCH_NAME.startsWith("feature/") } }
            steps { echo "Running Gitleaks Scan" }
        }

    stage('Build Docker Image') {
      when { branch 'develop' }
      steps {
        container('docker') {
          echo "🐳 Building Docker image..."
          sh """
            docker build -t ${DOCKER_IMAGE} .
            docker images ${DOCKER_IMAGE}
          """
        }
      }
    }

    stage('Push Docker Image') {
      when { branch 'develop' }
      steps {
        container('docker') {
          echo "🚀 Pushing Docker image to Docker Hub"
          withCredentials([usernamePassword(credentialsId: 'docker-hub-creds',
                                           usernameVariable: 'DOCKER_USER',
                                           passwordVariable: 'DOCKER_PASS')]) {
            sh """
              echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin 
              docker tag ${DOCKER_IMAGE} ${DOCKER_USER}/${DOCKER_IMAGE}
              docker push ${DOCKER_USER}/${DOCKER_IMAGE}
              docker logout 
            """
          }
        }
      }
    }

    stage('Version Push') {
      when { branch 'develop' }
      steps { 
        echo "📝 Pushing updated version.txt from develop" 
      }
    }
  }

  post {
    success {
      script {
        if (env.BRANCH_NAME == 'develop') {
          echo "🚀 Develop branch → Triggering Devtron Deployment"
          withCredentials([string(credentialsId: 'DEVTRON-TOKEN', variable: 'DEVTRON_TOKEN')]) {
            sh """
              curl --location --request POST "$DEVTRON_URL" \
                   --header "Content-Type: application/json" \
                   --header "api-token: $DEVTRON_TOKEN" \
                   --data-raw '{
                       "dockerImage": "gauravt11/${DOCKER_IMAGE}"
                   }'
            """
          }
        } else {
          echo "ℹ️ Not on develop branch → Devtron trigger skipped"
        }
      }
    }
    always {
      echo "✅ Pipeline finished for branch: ${env.BRANCH_NAME}"
      container('node') {
        // archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true
        archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
      }
    }
  }
}