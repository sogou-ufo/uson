(function(){

    var UsonInstance = function(name , options){
        this.name = name;
        this.data = options.data || null;
        this.queryData = {};
        this.url = options.url || null;
        if( this.url ){
            this.query = typeof options.query == 'object' ? $.param(options.query) : options.query;
        }
        options.dataProcessor && (this.dataProcessor = options.dataProcessor);
        options.done && ( this.done = options.done );
    };


    UsonInstance.prototype = {
        /**
         * 如果为ajax获取数据，获取后的数据操作
         * @param data Object 获取到的数据
         */
        dataProcessor: function(data){return data;},
        /**
         * 对象转化为字符串
         */
        getUniqueQuery: function(query){
            var keys = Object.keys(query);
            keys = keys.sort();
            var values = keys.map(function(item){
                return query[item];
            });
            return values.join('_');
        },
        /**
         * 获取有query的储存值
         */
        getQueryData: function(){
            if( !this.query )
                return;
            var query = typeof this.query == 'function' ? this.query() : this.query;
            if( typeof query == 'object' ){
                query = this.getUniqueQuery(query);
            }
            return this.queryData[query];
        },
        /**
         * 设置有query的储存值
         */
        setQueryData: function(data){
            if( !this.query )
                return;
            var query = typeof this.query == 'function' ? this.query() : this.query;
            if( typeof query == 'object' ){
                query = this.getUniqueQuery(query);
            }
            this.queryData[query] = data;
        },
        /**
         * 渲染结束
         * @param $el 容器的jquery对象
         */
        done: function(){},
        render: function($el){
            this.target = $el;
            if( !this.getQueryData()  && ( !this.data && this.url) ){
                var now = this;
                var querydata = typeof this.query == 'function'? this.query() : this.query;
                if( typeof querydata == 'string' ){
                    querydata += '&tm=' + (+new Date());
                }else if( querydata && typeof querydata =='object' ){
                    querydata.tm = +new Date();
                }else if( !querydata ){
                    querydata = '&tm=' + (+new Date());
                }
                $.ajax({
                    url: this.url,
                    data: querydata,
                    success: function(data){
                        if( typeof data == 'string' ){
                            data = JSON.parse(data);
                        }
                        if( now.query ){
                            now.setQueryData(data);
                        }else{
                            now.data = data;
                        }
                        
                        now._render(now.dataProcessor(data));
                    },
                    error: function(xhr,etype,err){
                        console.log(arguments);
                    }
                });
            }else{
                this._render(this.dataProcessor(this.getQueryData() || this.data));
            }
        },
        _render: function(data){
            var tpl = this.target.find('script[type="text/uson"]');

            if( tpl.length ){
                tpl = tpl[0].innerHTML;
                this.tpl = Ursa.compile(tpl);
            }
            if(this.tpl){
                if( $.isArray(data) ){
                    var html = '';
                    data.forEach(function(item,idx){
                        html += this.tpl({
                            item:item,
                            loop:{
                                index:+idx+1,
                                index0:+idx,
                                revindex:data.length-idx,
                                revindex0:data.length-idx-1,
                                first:(idx==0),
                                last:( idx==data.length-1 ),
                                length:data.length
                            }
                        });
                    }.bind(this));
                    this.target.html(html);
                }else{
                    this.target.html(this.tpl(data));
                }
                this.done(this.target);
            }
        }
    };

    
    var Uson = {
        /**
         * 渲染uson所有模块
         *
         * @param wrapper Selector|HTMLElement
         */
        render: function(wrapper){
            if( !this._searched )
                this.search();
            wrapper = $(wrapper).length? $(wrapper) : $(document.body);
            var els;

            if( wrapper[0].getAttribute('data-uson') ){//Bug,can't wrapper.data('uson')
                els = wrapper;
            }else{
                els = wrapper.find('*[data-uson]');
            }
            els.forEach(function(el, idx){
                el = $(el);
                var insName = el.data('uson');
                if( Uson.modules[insName] && el.css('display')!='none' ){
                    Uson.modules[insName].render(el);
                }
            });
        },
        get: function(name){
            return Uson.modules[name] || null;
        },
        search: function(){
            var els = $(document.body).find('*[data-uson]');
            els.forEach(function(el,idx){
                el = $(el);
                var insName = el.data('uson');
                if( Uson.modules[insName] ){
                    return;
                }else if( el.data('uson-data') && typeof el.data('uson-data') == 'object' ){
                    Uson.modules[insName] = new UsonInstance(insName , {
                        data:el.data('uson-data')
                    });
                }else if(el.data('uson-url') ){
                    Uson.modules[insName] = new UsonInstance( insName, {
                        url:el.data('uson-url')
                    });
                }else{
                    Uson.modules[insName] = new UsonInstance( insName, {
                        data:null
                    });
                }
            });

            this._searched = true;
            return this;
        },

        modules: {},

        create: function(name, options){
            var ins = new UsonInstance(name , options);
            Uson.modules[name] = ins;
            return ins;
        }
    };


    window['Uson'] = Uson;

})();
