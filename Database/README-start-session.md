# Systems Manager (SSM)のセッションマネージャー経由で接続

## EC2インスタンスID確認

i-0ba6585f33ff6465f

## 接続

    aws ssm start-session --target i-0ba6585f33ff6465f --document-name AWS-StartPortForwardingSession --parameters "portNumber=1433, localPortNumber=11433"
