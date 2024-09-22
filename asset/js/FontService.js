class FontService {

    constructor() {
        this.fontList = []
        this.fontGroupList = []
        this.groupItemCounter = 0
        this.groupEditItemCounter = 0
        this.selectdGroupId = null
        this.rules = {
            'font_group_length': 2,
            'group_name': 'required'
        }
        this.init()
    }

    uploadFont(file) {
        if (file && (file.type === "font/ttf")) {
            let reader = ''
            let fontData = ''
            let fontName = ''
            let newFontFace = ''
            reader = new FileReader();

            let _self = this
            reader.onload = function (e) {
                fontData = e.target.result;
                fontName = file.name.split('.')[0].replace(/\s+/g, '-'); // use filename as font name


                let isExits = _self.fontList.find(x => x.name == fontName)
                if (!isExits) {

                    let newFont = {"name": fontName, "data": fontData}
                    _self.fontList.push(newFont)
                    _self.lodeFontToBrowser(newFont)
                    _self.insertFontInTable(newFont)
                    _self.updateFontOptions()
                    _self.updateDatabase(newFont)
                    _self.fireNotification('success', 'Upload font successfully')
                }
            };

            reader.readAsDataURL(file); // Read the font file as a Data URL

        } else {
            this.fireNotification('danger', 'Please upload a valid font file (.ttf)')
        }
    }

    updateDatabase(font){
        /*Script to update database if required*/
    }

    lodeFontToBrowser(font){
        let newFontFace = `
                    @font-face {
                        font-family: '${font.name}';
                        src: url('${font.data}');
                    }
                `;

        // Inject @font-face rule into the page
        $('<style>').html(newFontFace).appendTo('head');
    }
    insertFontInTable(x) {

        let HTML = `
            <tr id="font_item_${x.name}">
                <td>${x.name}</td>
                <td style="font-family: ${x.name}">Example Style</td>
                <td><a class="font-delete" href="javascript:void(0)" data-id="${x.name}">Delete</a></td>
            </tr>`

        $('#font-list-table').append(HTML)

    }

    removeFont(fontId) {
        $(`#font_item_${fontId}`).remove()
        let index = this.fontList.findIndex(x => x.name == fontId)
        this.fontList.splice(index, 1)
        this.updateFontOptions()
        this.fireNotification('success', `Remove font successfully`)
    }

    addRowInGroup() {
        this.insertFontGroupRow(this.groupItemCounter)
    }

    createFontGroup() {

        let errorMessages = this.fontGroupValidation('fontGroupForm')
        if (!errorMessages.length) {
            let data = $('#fontGroupForm').serializeArray()


            let newGroup = this.convertFormDataToRowData(data)

            this.fontGroupList.push(newGroup)

            this.insertDataInGroupTable(newGroup)
            this.resetGroupTable()

            this.fireNotification('success', 'Group create successfully')

            localStorage.setItem('fontGroupList',JSON.stringify(this.fontGroupList))
        } else {

            let _self = this
            errorMessages.forEach(x => {
                _self.fireNotification('danger', x.message)
            })

        }


    }

    convertFormDataToRowData(formData) {
        let fonts = []
        let fontName = null
        let fontId = null

        formData.forEach(x => {
            let name = x.name
            name = name.split('][')
            if (name.length > 1) {
                let local_counter = name[0].substring(1)
                let parameter = name[1].substring(0, name[1].length - 1)


                if (parameter == 'font_id') {
                    fontId = x.value
                }
                if (parameter == 'name') {
                    fontName = x.value
                }
                if (fontId != null && fontName != null) {
                    fonts.push({'name': fontName, 'font_id': fontId})
                    fontId = null
                    fontName = null
                }
            }
        })

        return {
            'group_id': Math.round(Math.random() * 10000),
            'group_name': formData.find(x => x.name == 'group_name').value,
            'fonts': fonts
        }
    }

    insertDataInGroupTable(x) {

        let HTML = this.buildGroupTableRow(x)

        $("#font-group-table").append(HTML)
    }

    buildGroupTableRow(x) {

        let HTML = `
            <tr id="font_group_item_${x.group_id}">
                ${this.groupTableContextHTML(x)}
            </tr>`

        return HTML
    }

    groupTableContextHTML(x) {
        let fontList = ''
        x.fonts.forEach((x, i) => {
            if (i != 0) {
                fontList += ', '
            }
            fontList += x.name
        })

        let HTML = `
           <td>${x.group_name}</td>
                <td >${fontList}</td>
                <td >${x.fonts.length}</td>
                <td>
                <a class="font-group-edit" href="javascript:void(0)" data-id="${x.group_id}">Edit</a>
                <a class="font-group-delete" href="javascript:void(0)" data-id="${x.group_id}">Delete</a>
           </td>`

        return HTML
    }

    resetGroupTable() {
        $('#fontGroupForm').get(0).reset()
        $('#fontGroupItems').html('')
        this.groupItemCounter = 0
        this.insertFontGroupRow(this.groupItemCounter)
    }

    editFontGroup(groupId) {

        let _self = this
        let fontGroup = this.fontGroupList.find(x => x.group_id == groupId)

        let groupFontItems = ''
        fontGroup.fonts.forEach((x, i) => {
            groupFontItems += this.buildFontGroupRowHTML(i, x,true)
            _self.groupEditItemCounter++
        })

        $('#fontGroupEditForm [name="group_name"]').val(fontGroup.group_name)
        this.selectdGroupId = fontGroup.group_id
        $('#fontGroupEditItems').html(groupFontItems)
        $('#fontGroupEditModal').modal('show')
    }

    removeRowInGroup(rowId) {

        let openField = $('#fontGroupForm .card').length

        if (this.lengthValidation('fontGroupForm')) {
            rowId = '#fontGroupRow' + rowId
            $(rowId).remove()
        } else {
            this.fireNotification('danger', `At list ${this.rules.font_group_length} fonts need to create group`)
        }
    }

    addRowInEditGroup() {
        this.insertFontEditGroupRow(this.groupEditItemCounter)
    }

    updateFontGroup() {
        let errorMessages = this.fontGroupValidation('fontGroupEditForm')
        if (!errorMessages.length) {
            let data = $('#fontGroupEditForm').serializeArray()

            let index = this.fontGroupList.findIndex(x => x.group_id == this.selectdGroupId)

            let updateGroup = this.convertFormDataToRowData(data)

            this.fontGroupList[index].group_name = updateGroup.group_name
            this.fontGroupList[index].fonts = updateGroup.fonts

            let tableData = this.groupTableContextHTML(this.fontGroupList[index])

            $(`#font_group_item_${this.selectdGroupId}`).html(tableData)

            $('#fontGroupEditModal').modal('hide')

            this.fireNotification('success', 'Update font group successfully')
        } else {

            let _self = this
            errorMessages.forEach(x => {
                _self.fireNotification('danger', x.message)
            })

        }

    }

    removeRowInEditGroup(rowId) {

        if (this.lengthValidation('fontGroupEditForm')) {
            rowId = '#fontGroupEditRow' + rowId
            $(rowId).remove()
        } else {

            this.fireNotification('danger', `At list ${this.rules.font_group_length} fonts need to create group`)
        }
    }

    removeFontGroup(fontId) {
        $(`#font_group_item_${fontId}`).remove()
        let index = this.fontGroupList.findIndex(x => x.group_id == fontId)
        this.fontGroupList.splice(index, 1)
        this.updateFontOptions()
        this.fireNotification('success', `Remove font group successfully`)

    }

    insertFontGroupRow(count) {
        let HTML = this.buildFontGroupRowHTML(count)
        $('#fontGroupItems').append(HTML)
        this.groupItemCounter++
    }

    insertFontEditGroupRow(count) {
        let HTML = this.buildFontGroupRowHTML(count,null,true)
        $('#fontGroupEditItems').append(HTML)
        this.groupEditItemCounter++
    }

    buildFontGroupRowHTML(count, row = null,isEdit=null) {

        let defaultName = row ? row.name : null
        let defaultId = row ? row.font_id : null

        let HTML =
            `
        <div class="card mb-2" id="fontGroup${isEdit ? 'Edit' : ''}Row${count}">
            <div class="card-body shadow p-3 bg-white rounded">
                <div class="row">
                    <div class="col-3">
                        <input type="text" name="[${count}][name]" class="form-control form-control-md" ${defaultName ? "value=" + defaultName : ""} placeholder="Font name">
                    </div>
                    <div class="col-3 ">
                        <select name="[${count}][font_id]" id="" class="form-control form-control-md font-options" >
                        <option>Please select font</option>
                            ${this.buildFontOptionHTML(defaultId)}
                        </select>
                    </div>
                    <div class="col-3">
                        <input type="text" name="[${count}][size]" class="form-control form-control-md" placeholder="">
                    </div>
                    <div class="col-2">
                        <input type="text" name="[${count}][price]" class="form-control form-control-md" placeholder="">
                    </div>
                    <div class="col-1 text-center text-danger group-item-remove" data-id="${count}" style="cursor: pointer">
                        X
                    </div>
                </div>
            </div>
        </div>`
        return HTML
    }


    buildFontOptionHTML(name = null) {

        let HTML = ''

        this.fontList.forEach(x => {
            HTML +=
                `<option value="${x.name}" style="font-family: ${x.name}" ${name == x.name ? "selected" : ""}>${x.name}</option>`
        })

        return HTML
    }

    updateFontOptions() {

        let fontOptions = '<option>Please select font</option>'

        fontOptions += this.buildFontOptionHTML()
        $('.font-options').html(fontOptions)
    }


    fontGroupValidation(id) {
        let message = []

        let groupItemsRequiredLength = this.rules.font_group_length
        if (groupItemsRequiredLength) {
            let groupItems = $(`#${id} .card`).length

            if (groupItems < groupItemsRequiredLength) {
                message.push({'message': `At list ${groupItemsRequiredLength} fonts need to create group`})
            }
        }
        if (this.rules.group_name) {
            let groupName = $(`#${id} [name="group_name"]`).val()

            if (!groupName) {
                message.push({'message': 'Group name is required'})
            }

        }

        return message
    }

    lengthValidation(id, length = this.rules.font_group_length) {
        let status = false

        let openField = $(`#${id} .card`).length
        if (openField > length) {
            status = true
        }

        return status
    }

    fireNotification(status, message) {
        if (message) {
            if ($('#notification .alert').length) {
                let _self = this
                setTimeout(function () {
                    _self.generateNotificationMessage(status, message)
                }, 500)

            } else {
                this.generateNotificationMessage(status, message)
            }
        }
    }

    generateNotificationMessage(status, message) {
        let messageId = 'MSG' + Math.round(Math.random() * 1000)

        let messageBody = `<div class="alert alert-${status}" id="${messageId}" role="alert">
                ${message}
            </div>`
        $('#notification').append(messageBody)
        setTimeout(function () {
            $(`#${messageId}`).remove()
        }, 3000)
    }

    init(){

        let _self = this

        let fontList = []; /*fetch data from database and load if required*/
        let fontGroupList = []; /*fetch data from database and load if required*/

        if(fontList.length){
            fontList.forEach(x=>{
                let newFont = x
                _self.fontList.push(newFont)
                _self.lodeFontToBrowser(newFont)
                _self.insertFontInTable(newFont)
            })
        }

        if(fontGroupList.length){
            fontGroupList.forEach(x=>{
                _self.fontGroupList.push(x)
                _self.insertDataInGroupTable(x)
            })
        }

        this.addRowInGroup()

    }


}
