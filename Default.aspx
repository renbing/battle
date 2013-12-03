<%@ Page Language="C#" %>
<%@ import Namespace="System.IO" %>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <title>Giraffe</title>
<script runat="server">
        protected void Page_Load(object sender, EventArgs e)
        {
        }
        private List<string> scanDir(string mainPath, string path)
        {
            List<string> files = new List<string>();
            DirectoryInfo theFolder = new DirectoryInfo(mainPath + path);
            DirectoryInfo[] dirInfos = theFolder.GetDirectories();
            foreach (DirectoryInfo dirInfo in dirInfos)
            {
                if (dirInfo.Name.StartsWith("."))
                {
                    continue;
                }
                List<string> subs = this.scanDir(mainPath, path + "/" + dirInfo.Name);
                foreach (string file in subs)
                {
                    files.Add(file);
                }
            }
            FileInfo[] fileInfos = theFolder.GetFiles();
            foreach (FileInfo fileInfo in fileInfos)
            {
                if (fileInfo.Name.EndsWith(".js"))
                {
                    files.Add(path + "/" + fileInfo.Name);
                }
            }

            return files;
        }
</script>
<%
        string[] folders = new string[] {"web","framework","model","view","control" };
        foreach (string folder in folders)
        {
            List<string> files = scanDir(Server.MapPath(".") + "\\", folder);
            foreach (string file in files)
            {
                Response.Write(string.Format("    <script src='{0}' type='text/javascript' charset='utf-8'></script>\n", file));
            }
        }

        string []sizes = {"1024X768 iPad","960X640 iPhone","1136X640 iPhone5","1280X720 S3/Note2"};
        string defaultSize = sizes[0];
        if( Request.QueryString["size"] != null ) {
            defaultSize = Request.QueryString["size"]; 
        }
        
        string []segs = defaultSize.Split(' ')[0].Split('X');
        string width = segs[0];
        string height = segs[1];
%>
    <script id="shader-fs" type="x-shader/x-fragment">
        precision mediump float;
        varying vec4 vColor;

        void main(void) {
            gl_FragColor = vColor;
        }
    </script>

    <script id="shader-vs" type="x-shader/x-vertex">
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        varying vec4 vColor;

        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * aVertexPosition;
            vColor = aVertexColor;
        }
    </script>

    <script id="shader-tfs" type="x-shader/x-fragment">
        precision mediump float;
        varying vec2 vTextureCoord;

        uniform sampler2D uSampler;

        void main(void) {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
        }
    </script>

    <script id="shader-tvs" type="x-shader/x-vertex">
        attribute vec4 aVertexPosition;
        attribute vec2 aTextureCoord;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform mat4 uGLMMatrix;
        uniform vec2 aGLVPosition;

        varying vec2 vTextureCoord;

        void main(void) {
            gl_Position = uPMatrix * (uGLMMatrix * uMVMatrix * aVertexPosition + vec4(aGLVPosition, 0, 0));
            vTextureCoord = aTextureCoord;
        }
    </script>
        
    <script type="text/javascript">
        var Device = {
            width : <%= width %>,
            height : <%= height %>,
            name : 'webgl'
        };
    </script>
</head>
<body style="margin-left:20px" onload="gWeb.webGLStart()">
    <div style="margin-left:300px">
    <span>FPS:</span><span id="fps">60</span>
    <span>分辨率:</span>
    <select id="size" onchange="gWeb.changeSize();">
        <%
            foreach( string size in sizes ) {
                string selected = "";
                if( size == defaultSize ) {
                    selected = "selected=selected";
                }
                Response.Write("<option value='" + size + "' " + selected +" >" + size + "</option>");
            }
        %>
    </select>
    </div>
    <div>
        <canvas id="gl-canvas" style="border:none;" width=<%= width %> height=<%= height %>></canvas>
    </div>
</body>
</html>
