define(function (require, exports, module) {
    "use strict";
    
    var dir = 'C:/Users/greg.guidero/AppData/Roaming/Brackets/extensions/user/jira-brackets';
    var dataFile = 'data/jiradata.json';
    var userData = 'get/user.json';
    
    var AppInit = brackets.getModule("utils/AppInit");
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var Dialogs = brackets.getModule("widgets/Dialogs");
    var PanelManager = brackets.getModule("view/PanelManager");
    
    var html = require('text!style.json');  
    var getData = require('./get');
    
    var refreshData = function()
    {
        if(!getData.data.fetchingData)
        {
            $('#jiraB_Refresh').attr('src',dir+'/img/refresh.gif');
            $('#jiraB_Loader').css('display','');
            getData.data.requestData(getData.data.userData.domain,getData.data.userData.port,getData.data.userData.user,getData.data.userData.password);
        }
    }
    
    AppInit.appReady(function () 
    {
        ExtensionUtils.loadStyleSheet(module, "style.css");
        html = JSON.parse(html);
        
        var iconNode = $(html.panelButton);
        var panelNode = $(html.panel);
        iconNode.find('#jiraB_PanelButtonImage').attr('src',dir+'/img/jira.png').attr('width','27px').attr('height','27px');
        iconNode.appendTo($('#main-toolbar .buttons'));
        var panel = PanelManager.createBottomPanel('MainView',panelNode,31);
        $('#jiraB_MainPanel').css('height','400px');
        $('#jiraB_Refresh').attr('src',dir+'/img/refresh.gif');
        $('#jiraB_Loader').css('display','');
        $('#jiraB_Refresh').on('click',refreshData);
        panel.hide();
        
        iconNode[0].isPanelOpen = false;
        iconNode.on("click", function(e) {
            showPanel(this);
        });
        
        
        
        function showPanel(n)
        {
            if(n.isPanelOpen)
            {
                n.isPanelOpen = false;
                panel.hide();
            }
            else
            {
                n.isPanelOpen = true;
                panel.show();
            }
        }
        
        
        
    });
});