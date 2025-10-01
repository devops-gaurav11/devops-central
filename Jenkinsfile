pipeline {
  agent {
    kubernetes {
      yaml '''
apiVersion: v1
kind: Pod
spec:
  imagePullSecrets:
  - name: dockerhub-secret
  volumes:
  - name: npm-cache
    persistentVolumeClaim:
      claimName: npm-cache-pvc
  containers:
  - name: node
    image: node:22.18.0
    command:
    - cat
    tty: true
    volumeMounts:
    - name: npm-cache
      mountPath: /root/.npm 
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

  environment {
    DOCKER_IMAGE = "node-project:${BUILD_NUMBER}"
    DEVTRON_URL = 'http://80.225.201.22:8000/orchestrator/webhook/ext-ci/3'
  }
  triggers {
        pollSCM('* * * * *')
  }
  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10', daysToKeepStr: '30', artifactNumToKeepStr: '5'))
    timeout(time: 60, unit: 'MINUTES')
    skipDefaultCheckout(false)
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
          def commitMsg = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
          echo "Latest commit message: ${commitMsg}"
          def parts = commitMsg.split('#')
          if (parts.length != 2) error "❌ Commit message must contain a '#' followed by Jira ID!"
          def msgText = parts[0].trim()
          def jiraId = parts[1].trim()
          if (msgText.length() < 30) error "❌ Commit message text must be at least 30 characters!"
          if (!jiraId.matches("[A-Z]{2,}-\\d+")) error "❌ Jira ID after '#' is invalid! Example: ABC-123"
          echo "✅ Commit message validation passed"
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        echo "📦 Installing Node.js dependencies (with npm cache)"
        container('node') {
          // Use npm cache for faster installs
          sh '''
            echo "⚡ Using cached ~/.npm if available"
            npm ci --prefer-offline --no-audit --progress=false
          '''
        }
      }
    }


    stage('Run Tests') {
      when { expression { env.BRANCH_NAME.startsWith("feature/") } }
      steps {
        echo "🧪 Running React Tests with Coverage"
        container('node') {
          sh 'JEST_JUNIT_OUTPUT_DIR=. JEST_JUNIT_OUTPUT_NAME=test-results.xml CI=true npx react-scripts test --coverage --watchAll=false --reporters=default --reporters=jest-junit'
          junit allowEmptyResults: true, testResults: 'test-results.xml'
      publishHTML(target: [
      reportDir: 'coverage/lcov-report',
      reportFiles: 'index.html',
      reportName: 'Coverage Report',
      keepAll: true,
      alwaysLinkToLastBuild: true,
      allowMissing: true,
      includes: '**/*'
])
        }
      }
    }

    // stage('Build') {
    //   when { anyOf { expression { env.BRANCH_NAME.startsWith("feature/") }; branch 'develop' } }
    //   steps {
    //     echo "🚀 Building React App"
    //     container('node') {
    //       sh '''
    //         npm run build
    //       '''
    //     }
    //   }
    // }

    stage('SonarQube Scan') {
      when { expression { env.BRANCH_NAME.startsWith("feature/") } }
      steps { echo "🔍 Running SonarQube Scan" }
    }

    stage('OWASP Dependency Check') {
      when { expression { env.BRANCH_NAME.startsWith("feature/") } }
      steps { echo "🛡️ Running OWASP Dependency Check" }
    }

    stage('Gitleaks Scan') {
      when { expression { env.BRANCH_NAME.startsWith("feature/") } }
      steps { echo "🔒 Running Gitleaks Scan" }
    }

    stage('Build Docker Image') {
      when { branch 'develop' }
      steps {
        container('docker') {
          echo "🐳 Building Docker image..."
          withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin || true'
          }
          sh "docker build --pull -t ${DOCKER_IMAGE} . && docker images ${DOCKER_IMAGE}"
          sh 'docker logout || true'
        }
      }
    }

    stage('Push Docker Image') {
      when { branch 'develop' }
      steps {
        container('docker') {
          echo "🚀 Pushing Docker image to Docker Hub"
          withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
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
      steps { echo "📝 Pushing updated version.txt from develop" }
    }
  }

  post {
    success {
      script {
        if (env.BRANCH_NAME == 'develop') {
          echo "🚀 Triggering Devtron Deployment"
          withCredentials([string(credentialsId: 'DEVTRON-TOKEN', variable: 'DEVTRON_TOKEN')]) {
            sh """
              curl --location --request POST "$DEVTRON_URL" \
                   --header "Content-Type: application/json" \
                   --header "api-token: $DEVTRON_TOKEN" \
                   --data-raw '{ "dockerImage": "gauravt11/${DOCKER_IMAGE}" }'
            """
          }
        }
      }
    }
    always {
      echo "✅ Pipeline finished for branch: ${env.BRANCH_NAME}"
      
    }
  }
}
