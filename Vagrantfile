# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  # cluster nodes
  hosts = {
            :app1 => { :name => "hevi1", :address => "10.10.2.20" }
          }

  # Host setup template
  hosts.each do |host, params|
    config.vm.define "#{ params[:name] }" do |host|
      host.vm.box = "Ubuntu 15.04 - vivid64"
      host.vm.box_url = "https://cloud-images.ubuntu.com/vagrant/vivid/current/vivid-server-cloudimg-amd64-vagrant-disk1.box"
      host.ssh.private_key_path = "~/.vagrant.d/insecure_private_key"

      host.vm.provider :virtualbox do |vb|
        vb.customize [
                         "modifyvm", :id,
                         "--name", "cluster-#{ params[:name] }",
                         "--memory", 2048,
                         "--cpus", 1,
                     ]
      end

      host.vm.network :private_network, ip: "#{ params[:address] }"
      host.vm.hostname = "#{ params[:name] }"

      host.vm.provision "ansible" do |ansible|
        ansible.playbook = "ansible/provisioning/site.yml"
        ansible.inventory_path = "./ansible/local"
      end

      host.vm.provision "ansible" do |ansible|
        ansible.playbook = "ansible/deployment/site.yml"
        ansible.inventory_path = "./ansible/local"
      end

    end
  end

end
