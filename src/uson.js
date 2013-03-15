(function(){

    var UsonInstance = function(name , options){
        this.name = name;
        this.data = options.data || null;
        this.url = options.url || null;
        if( this.url ){
            if( typeof options.query == 'function' )
                options.query = options.query();
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
         * 渲染结束
         * @param $el 容器的jquery对象
         */
        done: function(){},
        render: function($el){
            this.target = $el;
            if( !this.data && this.url ){
                var now = this;
                $.ajax({
                    url: this.url,
                    data: this.query,
                    success: function(data){
                        now.data = now.dataProcessor(data);
                        now._render();
                    },
                    error: function(xhr,etype,err){
                        console.log(arguments);
                    }
                });
            }else if( this.data ){
                this._render();
            }
        },
        _render: function(){
            var tpl = this.target.find('script[type="text/uson"]');

            if( tpl.length ){
                tpl = tpl[0].innerHTML;
                this.tpl = Ursa.compile(tpl);
                if( $.isArray(this.data) ){
                    var html = '';
                    this.data.forEach(function(item,idx){
                        html += this.tpl({
                            item:item,
                            idx:idx
                        });
                    }.bind(this));
                    this.target.html(html);
                }else{
                    this.target.html(this.tpl(this.data));
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
            var els = wrapper.find('*[data-uson]');
            els.forEach(function(el, idx){
                el = $(el);
                var insName = el.data('uson');
                if( Uson.modules[insName] ){
                    Uson.modules[insName].render($(el));
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
