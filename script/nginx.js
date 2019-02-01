const fs = require('fs')
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const { decideFolder } = require('../libs/utils')
const proConfig = require('../config')
const { POST, HOST, NGPOST, name } = proConfig.app
const { serverName, road, sbin, sslPath, key, cat } = proConfig.nginx

const proPath = path.resolve(__dirname, '../')
const uploadsPath = path.join(proPath, 'uploads')
const configPath = path.resolve(__dirname, `${name}.conf`)
const nginxPath = path.join(road, `${name}.conf`)
const keyPath = path.join(sslPath, key)
const catPath = path.join(sslPath, cat)

let nginxConfig = `
server{
  listen ${NGPOST};
  ${
    serverName
      ? `listen 443 ssl;
  ssl_certificate ${catPath};
  ssl_certificate_key ${keyPath};
  server_name ${serverName};`
      : ''
  }

  charset utf-8;
	location ~* ^.+.(jpg|jpeg|png|gif){
		root ${uploadsPath};
		access_log off;
		expires 8h;
	}
  location /{
    client_max_body_size 50M;
    proxy_pass http://${HOST}:${POST};
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header REMOTE-HOST $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}`

decideFolder(road)

fs.writeFileSync(configPath, nginxConfig, 'utf8')

!(async () => {
  await exec(`sudo mv ${configPath} ${nginxPath}`)
  const { stdout, stderr } = await exec(
    `ps -ef | grep nginx | grep -v '.js' | grep -v grep | wc -l`
  )
  if (stderr) return
  if (Number(stdout) > 0) await exec(`sudo ${sbin} -s reload`)
  else await exec(`sudo ${sbin}`)
})()
