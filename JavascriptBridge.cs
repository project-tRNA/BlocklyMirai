using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace BlocklyMirai
{
    class JavascriptBridge
    {
        MainWindow mw;
        public JavascriptBridge(MainWindow mw)
        {
            this.mw = mw;
        }
        public string[] getLocalProjects()
        {
            List<string> result = new List<string>();
            DirectoryInfo projectsDir = new DirectoryInfo(Environment.CurrentDirectory + "/projects");
            if (!projectsDir.Exists) projectsDir.Create();
            foreach (FileInfo project in projectsDir.GetFiles("*.xml"))
            {
                result.Add(project.Name.Substring(0, project.Name.Length - 4));
            }
            return result.ToArray();
        }
        public void openFolder(string Folder)
        {
            if (Folder.StartsWith("./")) Folder = Environment.CurrentDirectory + Folder.Substring(1);
            Process.Start("explorer.exe", "\""+ Folder.Replace("/", "\\") + "\"");
        }
        public bool loadProject(string ProjectName)
        {
            FileInfo project = new FileInfo(Environment.CurrentDirectory + "/projects/" + ProjectName + ".xml");
            if (!project.Exists) return false;
            string xmlText = File.ReadAllText(project.FullName);
            mw.RunScript("Code.loadProject('" + ProjectName + "', '" + xmlText.Replace("\n", "\\n' + \n'").Replace("\r", "") + "');");
            return true;
        }
        public void saveProject(string ProjectName, string XmlSourceText)
        {
            App.CheckDir("projects");
            File.WriteAllText(Environment.CurrentDirectory + "/projects/" + ProjectName + ".xml", XmlSourceText);
        }

        /// <summary>
        /// 生成并构建插件
        /// </summary>
        /// <param name="PackageName"></param>
        /// <param name="ClassName"></param>
        /// <param name="PluginName"></param>
        /// <param name="PluginVersion"></param>
        /// <param name="PluginAuthor"></param>
        /// <param name="CodeText"></param>
        /// <returns></returns>
        public bool buildGradleProject(string ProjectName, string PackageName, string ClassName,
            string PluginName, string PluginVersion, string PluginAuthor,
            string CodeText)
        {
            try
            {
                try
                {
                    // 清空 gradle 项目文件夹再开始操作
                    if (Directory.Exists(Environment.CurrentDirectory + "/gradle_project"))
                        Directory.Delete(Environment.CurrentDirectory + "/gradle_project", true);
                }
                catch
                {
                    // 收声
                }

                string _namespace = MethodBase.GetCurrentMethod().DeclaringType.Namespace;
                Assembly _assembly = Assembly.GetExecutingAssembly();
                mw.RunScript("Code.receiveBuildOutput(\"正在释放 gradle-wrapper\");");

                // 释放并解压 gradle wrapper 以及编译脚本
                Stream stream = _assembly.GetManifestResourceStream(_namespace + ".gradle.wrapper.zip");
                App.UnZip(stream, Environment.CurrentDirectory + "/gradle_project");
                stream.Dispose();

                mw.RunScript("Code.receiveBuildOutput(\"正在保存源代码\");");
                App.CheckDir("gradle_project/src/main/java/" + PackageName.Replace(".", "/"));
                App.CheckDir("gradle_project/src/main/resources/META-INF/services");

                File.WriteAllText(Environment.CurrentDirectory + "/gradle_project/src/main/resources/META-INF/services/net.mamoe.mirai.console.plugin.jvm.JvmPlugin", PackageName + "." + ClassName);
                File.WriteAllText(Environment.CurrentDirectory + "/gradle_project/src/main/java/" + PackageName.Replace(".", "/") + "/" + ClassName + ".java", CodeText);

                mw.RunScript("Code.receiveBuildOutput(\"正在生成构建脚本\");");
                // 释放构建脚本
                stream = _assembly.GetManifestResourceStream(_namespace + ".gradle.build.gradle");
                string buildscript = new StreamReader(stream).ReadToEnd();
                stream.Dispose();

                buildscript = buildscript.Replace("${PluginName}", PluginName).Replace("${PackageName}", PackageName).Replace("${ClassName}", ClassName)
                    .Replace("${MainClass}", PackageName + "." + ClassName).Replace("${PluginVersion}", PluginVersion).Replace("${PluginAuthor}", PluginAuthor)
                    .Replace("${ProjectName}", ProjectName)
                    .Replace("${CoreVersion}", mw.Config["core_version"].ToString()).Replace("${ConsoleVersion}", mw.Config["console_version"].ToString());
                File.WriteAllText(Environment.CurrentDirectory + "/gradle_project/build.gradle", buildscript);

                // 开始构建
                Process process = new Process();
                Console.WriteLine(mw.Config["build_cmd"].ToString());
                process.OutputDataReceived += (object sender, DataReceivedEventArgs e) =>
                {
                    if (e.Data != null)
                    {
                        Console.WriteLine(e.Data);
                        mw.RunScript("Code.receiveBuildOutput(\"" + e.Data.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r") + "\");");
                    }
                };
                process.ErrorDataReceived += (object sender, DataReceivedEventArgs e) =>
                {
                    if (e.Data != null)
                    {
                        Console.WriteLine(e.Data);
                        mw.RunScript("Code.receiveBuildOutput(\"" + e.Data.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r") + "\");");
                    }
                };
                process.Exited += (object sender, EventArgs e) =>
                {
                    Console.WriteLine("已退出，退出码: " + process.ExitCode);
                    mw.RunScript("Code.receiveProcessExit(" + process.ExitCode + ");");
                };
                ProcessStartInfo psi = new ProcessStartInfo("cmd.exe", "/c" + mw.Config["build_cmd"].ToString());
                psi.WorkingDirectory = Environment.CurrentDirectory.Replace("/", "\\") + "\\gradle_project";
                psi.RedirectStandardOutput = true;
                psi.RedirectStandardError = true;
                psi.StandardErrorEncoding = Encoding.Default;
                psi.StandardOutputEncoding = Encoding.Default;
                psi.UseShellExecute = false;
                psi.CreateNoWindow = true;
                process.StartInfo = psi;
                process.EnableRaisingEvents = true;
                process.Start();
                mw.RunScript("Code.receiveBuildOutput(\"<font color=\\\"#00FF00\\\">构建进程已启动</font>\");");
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();
                return true;
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.ToString());
                mw.RunScript("Code.receiveBuildOutput(\"<font color=\"#FFFF00\">出现了一个异常:</font>\");");
                mw.RunScript("Code.receiveBuildOutput(\"<font color=\"#FFFF00\">" + ex.ToString() + "</font>\");");
                mw.RunScript("Code.receiveProcessExit(\"exception\");");
                return false;
            }
        }
        
    }
}
