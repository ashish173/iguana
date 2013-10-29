#!/usr/bin/ruby

# usage:
# from package root, do:
#   tasks/release/docs.rb  x.x.x
# where "x.x.x" is the version number

require 'rubygems'
require 'tmpdir'
require 'fileutils'
require 'open3'

unless File.exists?('bower.json') && File.exists?('Gruntfile.js')
  raise "release/docs must be run from package root"
end

def run(cmd, &on_error)
  stdin, stdout, stderr = Open3.popen3(cmd)
  err_message = stderr.read
  unless err_message == ""
    if block_given?
      yield(err_message)
    else
      puts err_message
      exit
    end
  end
  stdout
end

orig_working_dir = Dir.pwd

version = ENV['version'] || ARGV[0]

run("grunt groc")

Dir.mktmpdir do |tmpdir| 
  tmp_doc_dir = "#{tmpdir}/doc"
  FileUtils.cp_r('doc', tmp_doc_dir)
  run("git fetch origin")
  run("git checkout -b gh-pages origin/gh-pages") do |err_message|
    if err_message.match(/A branch named 'gh-pages' already exists/)
      run("git checkout gh-pages")
    else
      puts err_message
      exit
    end    
  end
  
  # FileUtils.mv(tmp_doc_dir, "doc/#{version}")
  # File.open("index.html", "a+") do |f|
  #   f.write(%q|\n<a href="docs/#{version}">Version #{version}</a>\n|)
  # end
end