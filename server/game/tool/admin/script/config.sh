mainClass="service.admin.Admin"

#Must choose unique serviceName per product. serviceName also use to kill process.
serviceName="KVTM_ADMIN_11"

#Should use -XX:+UseConcMarkSweepGC or -XX:+UseG1GC"
javaArgument="-server -Xms64m -Xmx512m -XX:+AggressiveOpts -XX:+UseConcMarkSweepGC"
appArgument="$serviceName"
