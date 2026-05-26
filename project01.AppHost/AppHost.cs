var builder = DistributedApplication.CreateBuilder(args);

var server = builder.AddProject<Projects.project01_Server>("server")
    .WithExternalHttpEndpoints();

var webfrontend = builder.AddNpmApp("webfrontend", "../frontend", "start")
    .WithReference(server)
    .WaitFor(server)
    .WithHttpEndpoint(port: 4200,env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();