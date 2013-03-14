uson docs
=========

## 概述

uson 意味 ursa for json project

主要是为多使用ajax异步渲染页面的项目开发的

## 基本形态 

可参见 test/index.html

## 基本接口

### Uson.create

接受参数
* name : string 唯一id
* options: object  配置

options参数如下
* data : object|string  模版的数据
* url: string  ajax获取的数据接口
* query: function|string|object   ajax获取数据的参数
* dataProcessor: function  ajax获取到数据后的处理函数
* done: function  渲染完成后的处理函数

### Uson.init

参数
* wrapper : selector|htmlelement  容器id或者jqeury对象，不填则为document.body


## 使用指南

### 添加模板

模板主要使用Ursa-js模版语法

在容器外层添加 `data-uson` 属性，值为唯一的名称

容器内使用 type 为 text/uson 的script标签，内嵌 ursa-js 模版

### 模版渲染

#### 简单模式

在容器上添加 data-uson-url 或者 data-uson-data ，对应options的属性，在页面底部执行 Uson.init 即可。

#### 高级模式

使用 Uson.create创建


