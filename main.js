define(function (require, exports, module) {
    "use strict";
    
    /* Globals */
    var localPath = null;
    var userInfo = JSON.parse(require('text!user.json'));
    var quickLink = null;
    var main = null;
    var mainPanel = null;
    var isPanelOpen = false;
    var infoExists = false;
    var data = null;
    var get = require('./get');
    
    /* templates */
    var mainTemplate = require('text!templates/Main.template');
    var quickLinkTemplate = require('text!templates/QuickLink.template');
    var inputModalTemplate = require('text!templates/Options.template');
     
    /* Images */  
    var refreshGif = require.toUrl('./img/refresh.gif');
    var refreshPng = require.toUrl('./img/refresh.png');
    var optionPng = require.toUrl('./img/settings.png');
    var jiraAddonLogo = require.toUrl('./img/jira.png');
    
    /* Brackets Modules */
    var AppInit = brackets.getModule("utils/AppInit");
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var Dialogs = brackets.getModule("widgets/Dialogs");
    var DialogsStyle = brackets.getModule("widgets/DefaultDialogs");
    var filesystem = brackets.getModule("filesystem/FileSystem");
    var FileUtils = brackets.getModule("file/FileUtils");
    var PanelManager = brackets.getModule("view/PanelManager");  
    
    /* Rest API Get for issues */
    var getIssues = function(init)
    {
        data = new get.data(userInfo);
        data.onFail = function(msg,code)
        {
            var error = '';
            console.log(code);
            switch(code)
            {
                case 401:
                    error = '401 AUTHORIZATION FAILED, USERNAME OR PASSWORD IS INCORRECT';
                break;
                case 404:
                    error = '404  ADDRESS DOES NOT EXIST, WEB ADDRESS OR PORT IS INCORRECT';
                break;
                case 500:
                
                break;
                case 600:
                    error = 'YOUR SETTINGS INFORMATION IS INCORRECT, PLEASE USE SETTINGS TO CORRECT ISSUE';
                break;
            }
             $('#jiraB_IssueWrapper').html('');
            Dialogs.showModalDialog(DialogsStyle.DIALOG_ID_SAVE_CLOSE,'Jira Connection Options',msg+error);
            $('#jiraB_Loader').css('display','none');
            $('#jiraB_Refresh').attr('src',refreshPng);
            data.fetchingData = false;
        }
        if(init)
        {
            data.onFinish = showPanel;
        }
        else
        {
            data.onFinish = null;
        }
        data.requestData(userInfo);
        
    }
    
    /* event based methods */
    var checkUserInfo = function()
    {
        if(!infoExists)
        {
            if(!userInfo.domain && !userInfo.user)
            {
                inputModal();
            }
            else
            {
                infoExists = true;
                getIssues();
                isPanelOpen = true;
                mainPanel.show();
            }
        }
        else
        {
            showPanel();
        }
    },
    infoInput = function(e)
    {
        userInfo[this.getAttribute('name')] = this.value;
    },
    saveUserInfo = function()
    {
        if(!userInfo.domain || !userInfo.user || !userInfo.password)
        {
            Dialogs.showModalDialog(DialogsStyle.DIALOG_ID_SAVE_CLOS,'Warning!','You Must Include Jira Username, Password, and Address in order to properly fetch issues');
            return false;
        }
        var userJson = filesystem.getFileForPath(localPath+'/user.json');
        FileUtils.writeText(userJson,JSON.stringify(userInfo),true);
        if(userInfo.domain.length > 0 && userInfo.user.length > 0)
        {
            if(!infoExists)
            {
                infoExists = true;
                getIssues(true);
            }
            else
            {
                refreshUserInfo();
            }
            
        }
    },
    showPanel = function(e)
    {
        if(isPanelOpen)
        {
            isPanelOpen = false;
            mainPanel.hide();
        }
        else
        {
            isPanelOpen = true;
            mainPanel.show();
        }
    },
    refreshContent = function()
    {
        if(!data.fetchingData)
        {
            data.onFinish = null;
            $('#jiraB_Refresh').attr('src',refreshGif);
            $('#jiraB_Loader').css('display','');
            data.requestData(userInfo);
        }
    },
    refreshUserInfo = function()
    {
        $('#jiraB_Projects').html('');
        data.fetchingData = false;
        data.projectNames = [];
        data.data = null;
        data.issues = null;
        data.projectSelection = 'All';
        refreshContent();
    }
    
    /* Dom Creation Methods */
    var attachQuickLink = function()
    {
        quickLink = $(quickLinkTemplate);
        quickLink.find('#jiraB_PanelButtonImage').attr('src',jiraAddonLogo);
        quickLink.appendTo($('#main-toolbar .buttons'));
        quickLink.on("click", function(e) 
        {
            checkUserInfo(this);
        });
    },
    createPanel = function()
    {
        main = $(mainTemplate);
        mainPanel = PanelManager.createBottomPanel('MainView',main,31);
        $('#jiraB_MainPanel').css('height','400px');
        $('#jiraB_Options').attr('src',optionPng);
        $('#jiraB_Refresh').attr('src',refreshGif);
        $('#jiraB_Loader').css('display','');
        $('#jiraB_Options').on('click',inputModal);
        $('#jiraB_Refresh').on('click',refreshContent);
        mainPanel.hide();
    },
    inputModal = function()
    {
        var inputs = Dialogs.showModalDialog(DialogsStyle.DIALOG_ID_SAVE_CLOSE,'Jira Connection Options',inputModalTemplate);
        $('#jiraB_InputUser').attr('value',userInfo.user);
        $('#jiraB_InputPassword').attr('value',userInfo.password);
        $('#jiraB_InputAddress').attr('value',userInfo.domain);
        $('#jiraB_InputPort').attr('value',userInfo.port);
        
        $('#jiraB_InputUser').on('input',infoInput);
        $('#jiraB_InputPassword').on('input',infoInput);
        $('#jiraB_InputAddress').on('input',infoInput);
        $('#jiraB_InputPort').on('input',infoInput);
        inputs.done(saveUserInfo);
    }
    
    AppInit.appReady(function () 
    {
        /* Get Path and Stylesheet */
        localPath = FileUtils.getNativeModuleDirectoryPath(module);
        ExtensionUtils.loadStyleSheet(module, "style.css");
        
        /* Create Dom Content */
        attachQuickLink();
        createPanel();
           
    });
    
});