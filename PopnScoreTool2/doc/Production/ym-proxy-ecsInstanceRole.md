# ym-proxy-ecsInstanceRole Policy

AWS 管理ポリシー AmazonSSMManagedInstanceCore
AWS 管理ポリシー AmazonEC2ContainerServiceforEC2Role
AWS 管理ポリシー AmazonSSMPatchAssociation
ym-ecs-instance-ddns-policy
管理ポリシー

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "route53:ChangeResourceRecordSets",
            "Resource": "arn:aws:route53:::hostedzone/{host_zone_id}}"
        }
    ]
}

ym-ecs-instance-proxy-attach-eip-policy
管理ポリシー

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "ec2:AssociateAddress",
            "Resource": [
                "arn:aws:ec2:ap-northeast-1:{aws_account_id}}:elastic-ip/{alloction_id}",
                "arn:aws:ec2:*:{aws_account_id}:instance/*"
            ]
        }
    ]
}
