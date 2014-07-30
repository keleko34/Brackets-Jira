define(function (require, exports, module) {
    "use strict";
    var dataReq = function(){
        var dtReq = {};
        dtReq.userData = JSON.parse(require('text!user.json'));
        dtReq.data = null;
        dtReq.fetchingData = false;
        dtReq.projectNames = new Array();
        dtReq.issues = null;
        dtReq.projectSelection = 'All';
        
        dtReq.issueGenerator = require('./issue');
        
        var dir = 'C:/Users/greg.guidero/AppData/Roaming/Brackets/extensions/user/jira-brackets';
        
        dtReq.loadContent = function(data)
        { 
            var projectList = $('#jiraB_Projects');
            if(dtReq.projectNames.indexOf('All') < 0)
            {
                dtReq.projectNames.push('All');
                var projectNode = $('<li>All</li>');
                projectList.append(projectNode);
                projectNode.on('click',function(){switchContent('All');});
            }
            $('#jiraB_IssueWrapper')[0].innerHTML = '';
            dtReq.issues = new Array();
            for(var x=0;x<data.issues.length;x++)
            {
                if(dtReq.projectNames.indexOf(data.issues[x].fields.project.name) < 0)
                {
                    dtReq.projectNames.push(data.issues[x].fields.project.name);
                    var projectNode = $('<li>'+data.issues[x].fields.project.name+'</li>');
                    projectList.append(projectNode);
                    projectNode.on('click',function(){switchContent(this.innerHTML);});
                }
                if(dtReq.projectSelection == 'All')
                {
                    dtReq.issues.push(new dtReq.issueGenerator.issue(data.issues[x]));
                }
                else if(dtReq.projectSelection == data.issues[x].fields.project.name)
                {
                    dtReq.issues.push(new dtReq.issueGenerator.issue(data.issues[x]));
                }
            }
            $('#jiraB_Loader').css('display','none');
            $('#jiraB_Refresh').attr('src',dir+'/img/refresh.png');
            dtReq.fetchingData = false;
            
            function switchContent(d)
            {
                if(!dtReq.fetchingData)
                {
                    dtReq.projectSelection = d;
                    dtReq.loadContent(dtReq.data);
                }
                else
                {
                    $('#jiraB_Loader').html('Please Wait For Data Before Selecting Projects');
                    setTimeout(function(){$('#jiraB_Loader').html('Fetching Data');},1000);
                }
            }
        }
        
        dtReq.requestData = function(url,port,name,pass)
        {
            if(!dtReq.fetchingData)
            {
                dtReq.fetchingData = true;
                var auth = btoa(name+':'+pass);
                if(port.length > 0)
                {
                    port = ':'+port;
                }
                var options = 
                {
                  host: url,
                  port: port,
                  path: '/rest/api/2/search?jql=assignee%3D%27'+name+'%27%26status%20IN%20(%271%27%2C%273%27)%0A',
                  method: 'GET',
                  headers:{'Content-Encoding':'gzip','Content-Type':'application/json;charset=UTF-8','Authorization':'Basic '+auth}
                };
                
                var xhtp = new XMLHttpRequest();
                xhtp.onreadystatechange = function()
                {
                    if(xhtp.readyState == 4)
                    {
                        if(xhtp.status == 200)
                        {
                            dtReq.data = JSON.parse(xhtp.responseText);
                            dtReq.loadContent(dtReq.data);
                        }
                        else
                        {
                            console.log('there was an error retrieving the data. ERROR: '+xhtp.status);
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
        }
        dtReq.requestData(dtReq.userData.domain,dtReq.userData.port,dtReq.userData.user,dtReq.userData.password);
        
        return dtReq;
    }
    exports.data = new dataReq();

});