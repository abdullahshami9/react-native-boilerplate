terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-1"
}

# Security Group
resource "aws_security_group" "app_sg" {
  name        = "app_security_group"
  description = "Allow HTTP, SSH, and App traffic"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Key Pair Generation
resource "tls_private_key" "pk" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "kp" {
  key_name   = "myKey"       # Create a "myKey" to AWS!!
  public_key = tls_private_key.pk.public_key_openssh
}

resource "local_file" "ssh_key" {
  filename = "${path.module}/private_key.pem"
  content  = tls_private_key.pk.private_key_pem
  file_permission = "0400"
}

# EC2 Instance
resource "aws_instance" "app_server" {
  ami           = "ami-051f7e7f6c2f40dc1" # Amazon Linux 2023 AMI in us-east-1
  instance_type = "t2.micro"
  key_name      = aws_key_pair.kp.key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              # Update system
              dnf update -y
              
              # Install Node.js 20
              dnf install -y nodejs
              
              # Install MySQL Server
              wget https://dev.mysql.com/get/mysql80-community-release-el9-1.noarch.rpm
              dnf install -y mysql80-community-release-el9-1.noarch.rpm
              dnf install -y mysql-server
              systemctl start mysqld
              systemctl enable mysqld
              
              # Secure MySQL (Automated - THIS IS BASIC, FOR PROD USE SECRETS)
              # Set root password to empty for compatibility with current code, OR change code.
              # Current code expects root with empty password.
              # mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '';" 
              # By default MySQL 8 on AL2023 might have a temp password.
              
              # Actually, Amazon Linux 2023 uses dnf and might have different package names. 
              # Let's stick to simple mariadb-server if mysql-server is complex, 
              # but code uses 'mysql2' which is compatible.
              dnf install -y mariadb105-server
              systemctl start mariadb
              systemctl enable mariadb
              
              # Install PM2 and Git
              npm install -g pm2 git
              
              # Create app directory
              mkdir -p /home/ec2-user/app
              chown -R ec2-user:ec2-user /home/ec2-user/app
              EOF

  tags = {
    Name = "AppStarterServer"
  }
}

output "public_ip" {
  value = aws_instance.app_server.public_ip
}
