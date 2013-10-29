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

def run(cmd, raise_on_error = true)
  puts cmd
  stdin, stdout, stderr = Open3.popen3(cmd)
  out, err = stdout.read, stderr.read
  if err != "" && raise_on_error
    raise RuntimeError.new(err)
  end
  [out, err]
end

version = ENV['version'] || ARGV[0]

orig_branch = run("git rev-parse --abbrev-ref HEAD")[0]
run("grunt groc")

Dir.mktmpdir do |tmpdir| 
  
  # copy the docs to a temporary location
  tmp_doc_dir = "#{tmpdir}/doc"
  FileUtils.cp_r('doc', tmp_doc_dir)
  
  # fetch all branches
  run("git fetch origin")
  
  # switch to gh-pages branch
  out, err = run("git checkout -b gh-pages origin/gh-pages", false)
  if err.match(/A branch named 'gh-pages' already exists/)
    out, err =  run("git checkout gh-pages", false)
  end
  
  if err != "" && !err.match(/Switched to branch/)
    raise RuntimeError.new(err)
  end
  
  
  # copy the docs to the right place an add a link to the index file
  begin
    FileUtils.rm_r("docs/#{version}")
  rescue; end
  FileUtils.mv(tmp_doc_dir, "docs/#{version}")
  unless File.read("index.html").match("docs/#{version}")
    File.open("index.html", "a+") do |f|
      f.write("<a href=\"docs/#{version}\">Version #{version}</a>")
    end
  end
  
  #run("git add .")
  #run("git commit -m\"Adding version #{version} docs\"")
  #run("git push origin gh-pages", false)
  #run("git checkout #{orig_branch}", false)
  
end