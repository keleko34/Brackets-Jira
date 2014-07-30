define(function (require, exports, module) {
    "use strict";
    var issue = function(issue)
    {
        this.issueTemplate = $(require('text!issue.template'));
        this.key = issue.key;
        this.summary = issue.fields.summary;
        this.description = issue.fields.description;
        this.type = {};
        this.type.name = issue.fields.issuetype.name;
        this.type.logo = issue.fields.issuetype.iconUrl;
        this.project = {}
        this.project.logo = issue.fields.project.avatarUrls['48x48'];
        this.project.name = issue.fields.project.name;
        this.reporter = {};
        this.reporter.name = issue.fields.reporter.displayName;
        this.reporter.email = issue.fields.reporter.emailAddress;
        this.reporter.photo = issue.fields.reporter.avatarUrls['48x48'];
        this.assignee = {};
        this.assignee.name = issue.fields.assignee.displayName;
        this.assignee.email = issue.fields.assignee.emailAddress;
        this.assignee.photo = issue.fields.assignee.avatarUrls['48x48'];
        this.comments = {};
        
        var issueWrapper = $('#jiraB_IssueWrapper');
        this.issueTemplate.find('.jiraB_IssueProjectLogo').attr('src',this.project.logo);
        this.issueTemplate.find('.jiraB_ProjectLink').html(this.project.name);
        this.issueTemplate.find('.jiraB_KeyLink').html(this.key);
        this.issueTemplate.find('.jiraB_IssueTypeLogo').attr('src',this.type.logo);
        this.issueTemplate.find('.jiraB_IssueType').html(this.type.name);
        this.issueTemplate.find('.jiraB_IssueSummary').html(this.summary);
        this.issueTemplate.find('.jiraB_IssueDescription').html(this.description);
        this.issueTemplate.find('.jiraB_IssueReporterImage').attr('src',this.reporter.photo);
        this.issueTemplate.find('.jiraB_IssueReporterName').html(this.reporter.name);
        this.issueTemplate.find('.jiraB_IssueReporterEmail').html(this.reporter.email);
        
        issueWrapper.append(this.issueTemplate);
    }
    
    
    
    exports.issue = issue;
});