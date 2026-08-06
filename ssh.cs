using System;
using Renci.SshNet;

class Program {
    static void Main(string[] args) {
        var connectionInfo = new ConnectionInfo("187.127.217.225", 22, "root", new PasswordAuthenticationMethod("root", "Shalini@20052006"));
        using (var client = new SshClient(connectionInfo)) {
            client.Connect();
            var cmd = client.CreateCommand("cd /opt/suvaialaya && git fetch origin main && git reset --hard origin/main && docker compose -f docker-compose.hostinger.yml up --build -d");
            var result = cmd.Execute();
            Console.WriteLine("Exit Status: " + cmd.ExitStatus);
            Console.WriteLine(result);
            Console.WriteLine(cmd.Error);
            client.Disconnect();
        }
    }
}
