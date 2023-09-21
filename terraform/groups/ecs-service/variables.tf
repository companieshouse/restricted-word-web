# ------------------------------------------------------------------------------
# Environment
# ------------------------------------------------------------------------------
variable "environment" {
  type        = string
  description = "The environment name, defined in environment's vars."
}
variable "aws_region" {
  default     = "eu-west-2"
  type        = string
  description = "The AWS region for deployment."
}
variable "aws_profile" {
  default     = "development-eu-west-2"
  type        = string
  description = "The AWS profile to use for deployment."
}

# ------------------------------------------------------------------------------
# Docker Container
# ------------------------------------------------------------------------------
variable "docker_registry" {
  type        = string
  description = "The FQDN of the Docker registry."
}

# ------------------------------------------------------------------------------
# Service performance and scaling configs
# ------------------------------------------------------------------------------
variable "desired_task_count" {
  type = number
  description = "The desired ECS task count for this service"
  default = 1 # defaulted low for dev environments, override for production
}
variable "required_cpus" {
  type = number
  description = "The required cpu resource for this service. 1024 here is 1 vCPU"
  default = 128 # defaulted low for dev environments, override for production
}
variable "required_memory" {
  type = number
  description = "The required memory for this service"
  default = 256 # defaulted low for node service in dev environments, override for production
}
variable "use_fargate" {
  type        = bool
  description = "If true, sets the required capabilities for all containers in the task definition to use FARGATE, false uses EC2"
  default     = false
}

# ------------------------------------------------------------------------------
# Service environment variable configs
# ------------------------------------------------------------------------------
variable "chs_url" {
  type        = string
}
variable "cookie_domain" {
  type        = string
}
variable "cookie_name" {
  type        = string
  default     = "__SID"
}
variable "log_level" {
  default     = "info"
  type        = string
  description = "The log level for services to use: trace, debug, info or error"
}
variable "node_env" {
  type        = string
}
variable "secure_cookie" {
  type        = string
  default     = "0"
}
variable "restricted_word_web_port" {
  type        = string
  default     = "3000"
}
variable "restricted_word_web_version" {
  type        = string
  description = "The version of the restricted word web container to run."
}
