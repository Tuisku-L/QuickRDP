# 干啥用的

一个管理 SSH 服务器的插件，可以实现:

- 添加 SSH 服务器
- 服务器分组
- 分组查看密码

当然，市面上有专业的 SSH 管理软件。这个插件只是为了给不想装乱七八糟软件的同学使用。

目前仅适用于 ```macOS```。未来会支持其他操作系统以及自定义终端软件。

# 怎么用

- 默认有一个 ```常用``` 分组，此分组无法删除。
- 添加自定义分组并且视情况设置查看密码。
- 分组下添加服务器，若服务器使用公钥验证，请确保你的私钥为 ```600``` 或更严格的权限。
- 在全局设置中可以选择使用系统自带的终端或 iTerm。
- 双击即可调用终端连接服务器。

# 特别说明

所有服务器数据均存储于本地 uTools 数据库中，若你开启了会员服务的同步功能则可以多设备自动同步服务器信息，本插件无任何除 uTools 自身功能外的网络连接功能，请放心使用。为了你的服务器安全，服务器的私钥文件不会通过 uTools 进行同步，若你需要在多台设备上使用本插件，请在每台设备上重新设置对应服务器的私钥文件。

# 截图

![](https://upload-save-1251792221.cos.ap-shanghai.myqcloud.com/public/3841617456273_.pic.jpg?imageMogr2/thumbnail/800x/format/webp/interlace/1/quality/100|watermark/2/text/QFNpbGVuY2VyTCAtIFYyQy50ZWNo/font/bXN5aGJkLnR0Zg/fontsize/16/fill/I2ZmZmZmZg/dissolve/70/gravity/southeast/dx/10/dy/10)

![](https://upload-save-1251792221.cos.ap-shanghai.myqcloud.com/public/3821617455145_.pic.jpg?imageMogr2/thumbnail/800x/format/webp/interlace/1/quality/100|watermark/2/text/QFNpbGVuY2VyTCAtIFYyQy50ZWNo/font/bXN5aGJkLnR0Zg/fontsize/16/fill/I2ZmZmZmZg/dissolve/70/gravity/southeast/dx/10/dy/10)

![](https://upload-save-1251792221.cos.ap-shanghai.myqcloud.com/public/3831617455220_.pic.jpg?imageMogr2/thumbnail/800x/format/webp/interlace/1/quality/100|watermark/2/text/QFNpbGVuY2VyTCAtIFYyQy50ZWNo/font/bXN5aGJkLnR0Zg/fontsize/16/fill/I2ZmZmZmZg/dissolve/70/gravity/southeast/dx/10/dy/10)

![](https://upload-save-1251792221.cos.ap-shanghai.myqcloud.com/public/3851617456294_.pic.jpg?imageMogr2/thumbnail/800x/format/webp/interlace/1/quality/100|watermark/2/text/QFNpbGVuY2VyTCAtIFYyQy50ZWNo/font/bXN5aGJkLnR0Zg/fontsize/16/fill/I2ZmZmZmZg/dissolve/70/gravity/southeast/dx/10/dy/10)

![](https://upload-save-1251792221.cos.ap-shanghai.myqcloud.com/public/3861617456342_.pic.jpg?imageMogr2/thumbnail/800x/format/webp/interlace/1/quality/100|watermark/2/text/QFNpbGVuY2VyTCAtIFYyQy50ZWNo/font/bXN5aGJkLnR0Zg/fontsize/16/fill/I2ZmZmZmZg/dissolve/70/gravity/southeast/dx/10/dy/10)