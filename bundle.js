(function() {
    window.XbYoutrack = {
      version: "0.2.1",
      renderUi: renderUi,
      token: null
    }
    
    var event = new CustomEvent('xbYoutrack.loaded', { detail: window.XbYoutrack });
    document.dispatchEvent(event);
    
    function renderUi(token) {
        window.XbYoutrack.token = token;
        var wrapper = document.createElement("td");
        wrapper.style.paddingLeft = '30px';
        var btn = document.createElement("input");
        btn.value = "Create YouTrack Ticket";
        btn.type = 'button';
        btn.classList.add('submit');
        btn.onclick = onClick;
        wrapper.append(btn);
        findButtonPlacement().append(wrapper);
    }

    function onClick(event) {
        var info = gatherInfoObject();
        var href = convertToUrl(info);
        createClientValue(function (){
            window.open(href);
        });
    }

    function findButtonPlacement() {
        return document.querySelector('input[value="Update"]').closest('tr');
    }

    function gatherInfoObject() {
        var info = {
            project: "WD",
            summary: getSummary(),
            description: getDescription(),
        };

        var params = new URLSearchParams(info);

        var attrFields = gatherAttributeFields();
        console.log(attrFields);
        attrFields.forEach(item => params.append('c', item));

        var textFields = gatherTextFields();
        console.log(textFields);
        textFields.forEach(item => params.append('textFields', item));

        console.log(params);

        return params;
    }

    function gatherAttributeFields() {
        var verificationDate = getVerificationDate();
        var dueDate = getDueDate();
        var estimation = getEstimation();
        var assignee = getAssignee();

        var fields = [
            'State ' + getState(),
            'Client ' + getClient()
        ];

        if (verificationDate) {
            fields.push('Verification date ' + verificationDate);
        }

        if (dueDate) {
            fields.push('Due Date ' + dueDate);
        }

        if (estimation) {
            fields.push('Estimation ' + estimation);
        }

        if (assignee) {
            fields.push('Assignee ' + assignee);
        }


        return fields;
    }

    function gatherTextFields() {
        var fields = [
            {id: '171-1', value: getExternalLinksText()},
            {id: '171-4', value: getRepoText()}
        ];

        return fields.map(item => new URLSearchParams(item).toString());
    }

    function getSummary() {
        var regex = /.*?\((.*)\)/;
        var input = document.querySelector('input[name="description"]');
        var matches = regex.exec(input.value);
        return matches && matches.length > 1 ? matches[1] : input.value;
    }

    function getDescription() {
        return "";
    }

    function getSpecLink() {
        var specLink = document.querySelector('a[href*="area=projects&target=specification&"]');
        return specLink ? "Specification: " + specLink.href + "&read_only_mode=yes" : "";
    }

    function getExternalLinksText() {
        return "Task: " + location.href + '\n' + getSpecLink();
    }

    function getRepoText() {
        return '';
    }

    function getAssignee() {
        var select = document.getElementById('u_id');
        var assignee = select.options[select.selectedIndex].text.split(",");
        return assignee && assignee.length > 1 ? assignee[0] : null;
    }

    function getState() {
        var select = document.getElementById('status');
        switch (select.value) {
            case 'W':
                return 'In Progress';
            case 'Q':
                return 'Quality Assurance';
            case 'E':
            case 'X':
                return 'Canceled';
            case 'V':
                return 'Waiting';
            case 'T':
                return 'Completed';
            case 'S':
            default:
                return 'Open';
        }
    }

    function getDueDate() {
        var input = document.getElementById('date_end-data');
        return input ? formatDate(input.value) : null;
    }

    function getVerificationDate() {
        var input = document.getElementById('verification_date-data');
        return input ? formatDate(input.value) : null;
    }

    function getEstimation() {
        var input = document.querySelector('input[name="hours"]');
        var value = parseInt(input.value);
        return value ? value + 'h' : null;
    }

    function getClient() {
        var element = document.querySelectorAll('.SubjectInfo_Light')[0];
        // Removing <span class="online_company" title="Online last hour">•</span>
        return element.innerText.replace("•", "").trim();
    }

    function formatDate(str) {
        var date = new Date(str);
        return String(date.getFullYear()) + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0');
    }

    function convertToUrl(params) {
        var baseUrl = "https://xcart.myjetbrains.com/youtrack/";
        const url = new URL('newIssue?' + params.toString(), baseUrl);
        return url.href;
    }

    function createClientValue(callback) {
        var data = JSON.stringify({
          "name": getClient(),
          "color": {
            "id": "0",
            "$type": "FieldStyle"
          },
          "description": "",
          "$type": "EnumBundleElement"
        });

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
              console.log(this.responseText);
              callback();
          }
        });

        xhr.open("POST", "https://xcart.myjetbrains.com/youtrack/api/admin/customFieldSettings/bundles/enum/77-4/values?$top=-1&fields=$type,archived,assembleDate,avatarUrl,color%28id%29,description,fullName,hasRunningJob,id,isResolved,issueRelatedGroup%28icon%29,localizedName,login,name,ordinal,owner%28id,login,ringId%29,releaseDate,released,ringId,showLocalizedNameInAdmin,teamForProject%28ringId%29,usersCount");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer " + window.XbYoutrack.token);
        xhr.setRequestHeader("Accept", "*/*");
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("cache-control", "no-cache");

        xhr.send(data);
    }

})();
