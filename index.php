<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Font and Apply to Text</title>
    <link rel="stylesheet" href="asset/style/css.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<div class="container">

    <!--file upload by drag and drop area-->
    <section class="mb-5">
        <h1 class="text-center mb-5">Font Group System</h1>
        <div id="dropArea">
            Drag & Drop Font File Here (TTF file only)
        </div>
        <input type="file" id="fontInput" accept=".ttf" style="display: none;">
    </section>


    <!--Show list of all uploaded font -->
    <section class="mb-5">
        <h4>Our Fonts</h4>
        <p>Brows a list of Zepto fonts to build you font group</p>
        <table class="table table-hover">
            <thead>
            <tr>
                <th scope="col">Font Name</th>
                <th scope="col">Preview</th>
                <th scope="col"></th>
            </tr>
            </thead>
            <tbody id="font-list-table">
<!--            <tr>-->
<!--                <td colspan="3"><p class="text-center mb-0">Font not fond</p></td>-->
<!--            </tr>-->

            </tbody>
        </table>
    </section>

    <section class="mb-5">
        <h4>Create font group</h4>
        <p>You have to select at list two</p>

        <div>
            <form action="" id="fontGroupForm">
                <input class="form-control form-control-md mb-3" type="text" name='group_name' placeholder="Enter group name">
                <div id="fontGroupItems" class="mb-3">
                </div>

                <div class="d-flex flex-row justify-content-between bd-highlight mb-3 px-3">
                    <a class="btn btn-info" href="javascript:void(0)" id="addFontGroupRow"> +Add Row</a>
                    <a class="btn btn-success" href="javascript:void(0)" id="createFontGroup">Create</a>
                </div>

            </form>


        </div>
    </section>

    <!--Show list of all uploaded font -->
    <section class="mb-5">
        <h4>Our Font Groups</h4>
        <p>List of all font group</p>
        <table class="table table-hover">
            <thead>
            <tr>
                <th scope="col">Name</th>
                <th scope="col">Fonts</th>
                <th scope="col">Count</th>
                <th scope="col"></th>
            </tr>
            </thead>
            <tbody id="font-group-table">
<!--            <tr>-->
<!--                <td colspan="4"><p class="text-center mb-0">Font group not fond</p></td>-->
<!--            </tr>-->
            </tbody>
        </table>

        <div class="modal fade" id="fontGroupEditModal" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Modal title</h5>
                    </div>
                    <div class="modal-body">
                        <form action="" id="fontGroupEditForm">
                            <input class="form-control form-control-md mb-3" type="text" name='group_name' placeholder="Enter group name">
                            <div id="fontGroupEditItems" class="mb-3">
                            </div>

                            <div class="d-flex flex-row justify-content-between bd-highlight mb-3 px-3">
                                <a class="btn btn-info" href="javascript:void(0)" id="editFontGroupRow"> +Add Row</a>
                                <a class="btn btn-success" href="javascript:void(0)" id="updateFontGroup">Update</a>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <div id="notification">
    </div>



</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="asset/js/FontService.js"></script>
<script>
    $(document).ready(function () {

        let zeptoFont = new FontService()


        $(document).on('dragover', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        $(document).on('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        $('#dropArea').on('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
            let files = e.originalEvent.dataTransfer.files;
            zeptoFont.uploadFont(files[0]);
        });

        $(document).on('click','.font-delete', function (e) {
            let fontId = $(this).data('id')
            zeptoFont.removeFont(fontId)
        });

        $('#addFontGroupRow').click(function (){
            zeptoFont.addRowInGroup()
        })

        $(document).on('click','#fontGroupForm .group-item-remove',function (){
            let rowId = $(this).data('id')
            zeptoFont.removeRowInGroup(rowId)
        })

        $('#createFontGroup').click(function (){
            zeptoFont.createFontGroup()
        })


        $(document).on('click','.font-group-delete', function (e) {
            let fontId = $(this).data('id')
            zeptoFont.removeFontGroup(fontId)
        });

        $(document).on('click','.font-group-edit', function (e) {
            let fontId = $(this).data('id')
            zeptoFont.editFontGroup(fontId)
        });

        $('#editFontGroupRow').click(function (){
            zeptoFont.addRowInEditGroup()
        })

        $('#updateFontGroup').click(function (){
            zeptoFont.updateFontGroup()
        })

        $(document).on('click','#fontGroupEditForm .group-item-remove',function (){
            let rowId = $(this).data('id')
            zeptoFont.removeRowInEditGroup(rowId)
        })

        // // Handle manual font upload
        // fontZone.on('click', function() {
        //     $('#fontInput').click();
        // });
        //
        // $('#fontInput').on('change', function() {
        //     var file = this.files[0];
        //     uploadFont(file);
        // });






    });
</script>
</body>
</html>

