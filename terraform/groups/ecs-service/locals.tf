# Define all hardcoded local variable and local variables looked up from data resources
locals {
  stack_name                = "search-service" # this must match the stack name the service deploys into
  name_prefix               = "${local.stack_name}-${var.environment}"
  service_name              = "restricted-word-web"
  container_port            = "3000" # default node port required here until prod docker container is built allowing port change via env var
  docker_repo               = "restricted-word-web"
  lb_listener_rule_priority = 96
  lb_listener_paths         = ["/admin/restricted-word","/admin/restricted-word/.*%"]
  healthcheck_path          = "/admin/restricted-word/healthcheck" #healthcheck path for restricted word web
  healthcheck_matcher       = "200"

  kms_alias                 = "alias/${var.aws_profile}/environment-services-kms"
  service_secrets           = jsondecode(data.vault_generic_secret.service_secrets.data_json)

  parameter_store_secrets    = {
    "vpc_name"                  = local.service_secrets["vpc_name"]
    "internal_api_url"          = local.service_secrets["internal_api_url"]
    "cache_server"              = local.service_secrets["cache_server"]
    "chs_internal_api_key"      = local.service_secrets["chs_internal_api_key"]
  }

  vpc_name                  = local.service_secrets["vpc_name"]
  internal_api_url          = local.service_secrets["internal_api_url"]
  cache_server              = local.service_secrets["cache_server"]
  chs_internal_api_key      = local.service_secrets["chs_internal_api_key"]

  # create a map of secret name => secret arn to pass into ecs service module
  # using the trimprefix function to remove the prefixed path from the secret name
  secrets_arn_map = {
    for sec in data.aws_ssm_parameter.secret:
      trimprefix(sec.name, "/${local.name_prefix}/") => sec.arn
  }

  service_secrets_arn_map = {
    for sec in module.secrets.secrets:
      trimprefix(sec.name, "/${local.service_name}-${var.environment}/") => sec.arn
  }

  task_secrets = [
    { "name": "VPC_NAME", "valueFrom": "${local.service_secrets_arn_map.vpc_name}" },
    { "name": "COOKIE_SECRET", "valueFrom": "${local.secrets_arn_map.web-oauth2-cookie-secret}" },
    { "name": "CHS_INTERNAL_API_KEY", "valueFrom": "${local.service_secrets_arn_map.chs_internal_api_key}" },
    { "name": "CACHE_SERVER", "valueFrom": "${local.service_secrets_arn_map.cache_server}" },
    { "name": "INTERNAL_API_URL", "valueFrom": "${local.service_secrets_arn_map.internal_api_url}" }
  ]

  task_environment = [
    { "name": "LOG_LEVEL", "value": "${var.log_level}" },
    { "name": "COOKIE_DOMAIN", "value": "${var.cookie_domain}" },
    { "name": "COOKIE_NAME", "value": "${var.cookie_name}" },
    { "name": "SECURE_COOKIE", "value": "${var.secure_cookie}" },
    { "name": "RESTRICTED_WORD_WEB_PORT", "value": "${var.restricted_word_web_port}" } 
  ]
}