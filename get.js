define(function (require, exports, module) {
    "use strict";
    
    /* Main Data Object */
    var data = function(userData)
    {
        /* Properties */
        this.userInfo = userData;
        this.data = null;
        this.projectSelection = 'All';
        this.fetchingData = false;
        this.projectNames = [];
        this.issues = null;
        this.onFinish = null;
        this.onFail = null;
        
        this.issueGenerator = require('./issue');
        
        var obj = this;
        /* Images */
        var refreshPng = require.toUrl('./img/refresh.png');
        
        /* Ajax Method */
        var xhtp = new XMLHttpRequest();
        var fetchData = function(options)
        {
            xhtp.onreadystatechange = function()
                {
                    if(xhtp.readyState == 4)
                    {
                        if(xhtp.status == 200)
                        {
                            obj.data = JSON.parse(xhtp.responseText);
                            if(typeof obj.data.warningMessages != 'undefined')
                            {
                                obj.onFail('there was an error retrieving the data. ERROR: ',600);
                                return;
                            }
                            obj.loadIssues();
                            if(obj.onFinish)
                            {
                                obj.onFinish(obj.data);
                            }
                        }
                        else
                        {
                            if(obj.onFail)
                            {
                                obj.onFail('there was an error retrieving the data. ERROR: ',xhtp.status);
                            }
                        }
                    }
                }
                xhtp.open(options.method, 'https://'+options.host+options.port+options.path, true);
                for(var h in options.headers)
                {
                   xhtp.setRequestHeader(h,options.headers[h]);
                }
                xhtp.send();
        }
        
        /* Events */
        this.switchProject = function(e)
        {
            if(!obj.fetchingData)
            {
                obj.projectSelection = this.innerHTML;
                obj.loadIssues();
            }
            else
            {
                $('#jiraB_Loader').html('Please Wait For Data Before Selecting Projects');
                setTimeout(function(){$('#jiraB_Loader').html('Fetching Data');},1000);
            }
        }
        
        /* Methods */
        this.requestData = function(userInfo)
        {
            if(!this.fetchingData)
            {
                this.fetchingData = true;
                var auth = btoa(userInfo.user+':'+userInfo.password);
                var port = userInfo.port;
                if(port.length > 0)
                {
                    port = ':'+port;
                }
                var options = 
                {
                  host: userInfo.domain,
                  port: port,
                  path: '/rest/api/2/search?jql=assignee%3D%27'+userInfo.user+'%27%26status%20IN%20(%271%27%2C%273%27)%0A',
                  method: 'GET',
                  headers:{'Content-Encoding':'gzip','X-Atlassian-Token': 'no-check','Content-Type':'application/json;charset=UTF-8','Authorization':'Basic '+auth}
                };
                
                fetchData(options);
                
            }
        }
        
        this.loadIssues = function()
        {
            var projectList = $('#jiraB_Projects');
            this.issues = [];
            if(this.projectNames.indexOf('All') < 0)
            {
                this.projectNames.push('All');
                var projectNode = $('<li>All</li>');
                projectList.append(projectNode);
                projectNode.on('click',this.switchProject);
            }
            $('#jiraB_IssueWrapper').html('');
            for(var x=0;x<this.data.issues.length;x++)
            {
                if(this.projectNames.indexOf(this.data.issues[x].fields.project.name) < 0)
                {
                    this.projectNames.push(this.data.issues[x].fields.project.name);
                    var projectNode = $('<li>'+this.data.issues[x].fields.project.name+'</li>');
                    projectList.append(projectNode);
                    projectNode.on('click',this.switchProject);
                }
                if(this.projectSelection == 'All')
                {
                    this.issues.push(new this.issueGenerator.issue(this.data.issues[x]));
                }
                else if(this.projectSelection == this.data.issues[x].fields.project.name)
                {
                    this.issues.push(new this.issueGenerator.issue(this.data.issues[x]));
                }
            }
            $('#jiraB_Loader').css('display','none');
            $('#jiraB_Refresh').attr('src',refreshPng);
            this.fetchingData = false;
        }      
        
    }
    
    exports.data = data;
});